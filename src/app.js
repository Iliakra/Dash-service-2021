import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import createError from 'http-errors'

import handlebars from 'express-handlebars';

import indexRouter from './routes/indexRouter.js';
import resourceRouter  from './routes/resourceRouter.js';
import downloadRouter  from './routes/downloadRouter.js';
import saveRouter  from './routes/saveRouter.js';

import dictionary  from './dictionary.js';



// Приложение на базе Express
const app = express();

// Удалить заголовок в целях безопасности
app.disable('x-powered-by');

// Задаем систему форматирования вывода
// TODO: Выбрать более собвременный модуль. Этот уже старый и не поддерживается
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");

app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'handlebars');
app.enable('view cache');

// TODO: Использовать защиту (npm install --save helmet) https://expressjs.com/ru/advanced/best-practice-security.html

// Подключаются модули Express для обработки запроса

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "views/images")));
app.use(express.static(path.join(__dirname, '../public')));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Разводим по роутерам

// Роутер обрабатывающий дашборды
app.use("/dashboard/", resourceRouter);
app.use("/download/", downloadRouter);
app.use("/save/", saveRouter);


app.use("/policy", function(req,res){
  res.render("policy",{layout:"long"});
});

// Роутер, обрабатывающий индекс
app.use('/', indexRouter);

// Обработчик необработанного запроса - генерирует ошибку 404
app.use(function (req, res, next) {
  // next(createError(404));
  res.status(404);
  res.render("404",dictionary.error404);
});

// Обработчик внутренних ошибок
app.use(function (err, req, res, next) {
  switch (err) {
    case dictionary.errorStatuses.downloadError:{
      res.render("error",{layout:"simple",...dictionary.downloadCurrentlyBlocked});
      break;
    }
    default: {
      if (err.status===404) {
        res.render("404Internal",{layout:"simple",...dictionary.error404Internal});
      } else {
        res.status(err.status || 500);
        res.render("error",{
          ...dictionary.error,
          title:(err.status || 500),
          error:req.app.get("env") === "development" ? err : {},
        });
      }
    }
  }
});

export default app;
