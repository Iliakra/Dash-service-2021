import express from "express";
import path from "path"
import settings from "../settings.js";

import {getMatches} from "../helpers/stringTools.js";
import {restoreDashboardPath, protectUrl} from "../helpers/urlTools.js";

// Создаем роутер
const resourceRouter = express.Router();

// Определяем обработчик любого URL
resourceRouter.get("/*", function (
  req,
  res,
  next
) {

  // Получаем путь, начиная с базового
  let reqPath=req.params[0];

  // Обеспечим безопасность пути
  reqPath=protectUrl(reqPath);

  // Получаем по регулярному выражению список из трех компонентов пути - клиент, кампания, файл с относительными путями
  let matches=getMatches(/([^/]+)\/([^/]+)\/([\s\S]*)/gi,reqPath,3)

  // Список обязательно должен содержать 3 компонента. Если меньше - url неверный - игнор.
  // И еще - на конце пути должен быть обязательно слэш. Иначе относительнвй путь у дашборда будет неверный. Это учитывается нашей проверкой
  if ((matches)&&(matches[0])&&(matches[0].length===3)) {

  // Наш URL имеет красивый внешний вид, без спецсимволов.
  // Поэтому, обработаем два параметра и вернем им нужный вид
    let clientName=restoreDashboardPath(matches[0][0]); //Имя клиента
    let campName=restoreDashboardPath(matches[0][1]); //Имя кампании

    let extraPath=matches[0][2]; //файл с относительными путями

    // Получаем путь до файла на диске
    let filePath=path.join(settings.converterCloudPath,clientName,campName,settings.productFolderName);

    // Проверяем - если путь файла пустой - выводим дашборд. Иначе - файл
    if (extraPath==="") {
      filePath=path.join(filePath,settings.dashboardFileName);
    } else {
      filePath=path.join(filePath,extraPath);
    }

    // Резолвим путь, чтобы он был правильным
    filePath=path.resolve(filePath);

    // Отправляем содержимое файла из полученного пути на диске
    res.sendFile(filePath);

  } else {
    next();
  }


});

export default resourceRouter;
