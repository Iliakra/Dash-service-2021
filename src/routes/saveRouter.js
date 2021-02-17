import express from "express";
import path from "path"
import settings from "../settings.js";

import {getMatches} from "../helpers/stringTools.js";
import {restoreDashboardPath, protectUrl} from "../helpers/urlTools.js";
const xlsx = require("xlsx");


const saveRouter = express.Router();
//const bodyParser = require('body-parser');
//saveRouter.use(bodyParser.urlencoded({ extended: true }));
//saveRouter.use(bodyParser.json());

saveRouter.post('/*', function(
  req, 
  res, 
  next
  ) {
  // Получаем путь, начиная с базового
  let reqPath=req.params[0];

  // Получаем тело POST запроса с таблицей
  let data = req.body;

  // Из тела запроса выделяем название листа
  let sheet = data.splice(data.length-1,1)[0];

  // Из тела запроса выделяем поле с type и options
  let optionsContent = data.splice(0,2);

  // Обеспечим безопасность пути
  reqPath=protectUrl(reqPath);

  // Получаем по регулярному выражению список из трех компонентов пути - клиент, кампания, файл с относительными путями
  let matches=getMatches(/([^\/]+)\/([^\/]+)\/([\s\S]*)/gi,reqPath,3);

  if ((matches)&&(matches[0])&&(matches[0].length===3)) {

    // Наш URL имеет красивый внешний вид, без спецсимволов.
    // Поэтому, обработаем два параметра и вернем им нужный вид
    let clientName=restoreDashboardPath(matches[0][0]); //Имя клиента
    let campName=restoreDashboardPath(matches[0][1]); //Имя кампании
    let feedFileName=matches[0][2];

    // Получаем путь до файла на диске
    let filePath=path.join(settings.converterCloudPath,clientName,campName,feedFileName);

    // Резолвим путь, чтобы он был правильным
    filePath=path.resolve(filePath);

    // Чтение нужного файла xlsx, создание новой таблицы из данных, запись ее в файл
    let workbook = xlsx.readFile(filePath);
    let ws = xlsx.utils.json_to_sheet(optionsContent, {skipHeader: true});
    xlsx.utils.sheet_add_json(ws, data, {origin: "A3"});
    workbook.Sheets[sheet] = ws;
    xlsx.writeFile(workbook,filePath);
    res.send(data);
  
    } else {
      next();
    }
});

export default saveRouter;