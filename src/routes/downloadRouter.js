import express from "express";
import path from "path"
import settings from "../settings.js";
import dictionary from "../dictionary.js";
import zip from "express-zip"

import {getMatches} from "../helpers/stringTools.js";
import {restoreDashboardPath, protectUrl} from "../helpers/urlTools.js";
import {getFolderFiles} from "../helpers/fileTools.js";

var downloadRouter = express.Router();

var downloadCount = 0;

/* GET home page. */
downloadRouter.get('/*', function(req, res, next) {

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
    // Получаем путь до папки на диске
    let filePath=path.join(settings.converterCloudPath,clientName,campName,settings.productFolderName,settings.publishFolderName);
    // Резолвим путь, чтобы он был правильным
    filePath=path.resolve(filePath);
    // Получаем имя архива
    let fileName=campName.replace(/\s+/gi,"_")+".zip";

    // Собираем файлы из папки,которую надо архивировать
    let files=[];
    // Используем функцию, которая возвращает все файлы в папке и подпапках с относительными путями
    let fileList=getFolderFiles(filePath)
    for (let name in fileList) {
      files.push({ path: fileList[name], name: name })
    }

    downloadCount++;
    if (downloadCount>settings.downloadLimit) {
      next(dictionary.errorStatuses.downloadError);
      return;
    }

    // Архивируем и отправляем стрим в респонс
    res.zip(
      files,
      fileName,
      (err)=>{
        downloadCount--;
        if (err) {
          console.log("Error while downloading:", err," Download count:",downloadCount);
          res.end();
        } else {
          console.log("Successfully downloaded:",fileName," Download count:",downloadCount);
        }
      }
    );

  } else {
    next();
  }

});

export default downloadRouter;
