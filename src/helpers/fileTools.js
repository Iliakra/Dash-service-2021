import fs from 'fs'
import {getFilePath,getFileExt} from "./stringTools"

export const pathExists = (path) =>
{
  let fileExists = false;
  try {
    fs.accessSync(path, fs.constants.F_OK);
    fileExists=true;
  } catch (e) {
  }
  return fileExists;
}

export const getMaxTime = (path) =>
{
  let stats=fs.statSync(path);
  return Math.max(stats.mtime,stats.birthtime);
}

// Возвращает все файлы в папке с относительными путями
export const getFolderFiles = (path,types,except,subFolder) =>
{
  if (!subFolder) subFolder="";
  let files=[];
  try {
    files = fs.readdirSync(path);
  } catch (e) {
  }
  let result={}
  for (let i = 0; i < files.length; i++){
    let fileName=files[i];
    let fullName=(subFolder=="")?fileName:subFolder+"/"+fileName;

    if (except) {
      let accept=true;
      for (let j = 0; j < except.length; j++) {
        if (fileName.indexOf(except[j])>=0) {
          accept=false;
          break;
        }
      }
      if (!accept) continue;
    }

    let stats=fs.statSync(path+"/"+fileName);
    if (stats.isDirectory()) {
      result={
        ...result,
        ...getFolderFiles(path+"/"+fileName,types,except,fullName),
      }
      continue;
    }

    let fileExt=getFileExt(fileName);
    if (fileExt) {
      fileExt=fileExt.toLowerCase();
    }
    if ((types)&&(types.indexOf(fileExt)<0)) {
      continue;
    }

    result[fullName]=path+"/"+fileName
  }
  return result;
}




// Возвращает все папки в папке с относительными путями
export const getFolderSubFolders = (path,subFolder,prefix) =>
{
  if (!prefix) prefix="";
  if (!subFolder) subFolder="";
  let files=[];
  try {
    files = fs.readdirSync(path);
  } catch (e) {
  }
  let result={}
  for (let i = 0; i < files.length; i++){
    let fileName=files[i];
    let fullName=(subFolder=="")?fileName:subFolder+"/"+fileName;

    let stats=null;
    try {
      stats=fs.statSync(path+"/"+fileName);
    } catch (e) {
    }

    if ((stats)&&(stats.isDirectory())) {
      result={
        ...result,
        ...getFolderSubFolders(path+"/"+fileName,fullName,prefix),
      }
      result[prefix+fullName]=path+"/"+fileName
      continue;
    }

  }
  return result;
}







export const getMaxTimeInFolder = (path,time) =>
{
  let files = fs.readdirSync(path);
  for (let i = 0; i < files.length; i++){
    let name=path+"/"+files[i];
    let stats=fs.statSync(name);
    let curTime=0;
    if (stats.isDirectory()){
        time=Math.max(time,getMaxTimeInFolder(name,time));
    } else {
        time=Math.max(time,Math.max(stats.mtime,stats.birthtime));
    }
  }
  return time;
}

export const getFileTime = (path) =>
{
  let stats=fs.statSync(path);
  return Math.max(stats.mtime,stats.birthtime);
}

export const findFileInFolder = (path,name) =>
{
  let files = fs.readdirSync(path);
  for(let i=0;i<files.length;i++){
    let fileName=files[i];
    if (fileName.indexOf(name)>=0)
    return fileName;
  }
  return null;
}

export const getFileNamesInFolder = (path,regExp) =>
{
  let result=[];
  let files=[];
  try {
    files = fs.readdirSync(path);
  } catch (e) {
  }
  for(let i=0;i<files.length;i++){
    let fileName=files[i];
    if (fileName.match(regExp)) {
      result.push(fileName);
    }
  }
  if (result.length===0) return null;
  return result;
}

export const getFileNamesAndSizesInFolder = (path,regExp) =>
{
  let result=[];
  let files=[];
  try {
    files = fs.readdirSync(path);
  } catch (e) {
  }
  for(let i=0;i<files.length;i++){
    let fileName=files[i];
    if (fileName.match(regExp)) {
      result.push(
        {
          name:fileName,
          size:getFileSize(path+"/"+fileName),
        });
    }
  }
  if (result.length===0) return null;
  return result;
}

export const deleteFile = (path) =>
{
  try {
    fs.unlinkSync(path);
  } catch (e) {
    return false;
  }
  return true;
}

export const purgeFile = (path) =>
{
  let result=[];

  let fileExists = false;
  try {
    fs.accessSync(path, fs.constants.F_OK);
    fileExists=true;
  } catch (e) {
  }

  if (fileExists) {
    try {
      fs.unlinkSync(path);
    } catch (error) {
      result.push({message:dictionary.errors.fileDeleteError,path:path,error:error});
    }
  }
  return result;
}

export const purgeFolder = (path,contentOnly,checkIfFile) =>
{
  if ((path==="")||(path==="/")) {
    return [{message:dictionary.errors.purgeFolderDangerous,path:path}]
  }

  let result=[];

  let folderExists = false;
  try {
    fs.accessSync(path, fs.constants.F_OK);
    folderExists=true;
  } catch (e) {
  }

  if (folderExists) {

    // Если надо проверить файл ли это
    if (checkIfFile) {
      let isDirectory = false;
      try {
        isDirectory=fs.statSync(path).isDirectory();
      } catch (error) {
        result.push({message:dictionary.errors.fileStatError,path:path,error:error.message});
      }
      if (!isDirectory) {
        try {
          fs.unlinkSync(path);
        } catch (error) {
          result.push({message:dictionary.errors.fileDeleteError,path:path,error:error.message});
        }
        return result;
      }
    }

    let files = [];
    try {
      files = fs.readdirSync(path);
    } catch (error) {
      result.push({message:dictionary.errors.readDirError,path:path,error:error.message});
    }
    for (let i=0;i<files.length;i++){
      let fileName=files[i];
      let pathToFile = path+"/"+fileName;

      let isDirectory = false;
      try {
        isDirectory=fs.statSync(pathToFile).isDirectory();
      } catch (error) {
        result.push({message:dictionary.errors.fileStatError,path:pathToFile,error:error.message});
      }
      if (isDirectory) {
        result=result.concat(purgeFolder(pathToFile,false));
      } else {
        try {
          fs.unlinkSync(pathToFile);
        } catch (error) {
          result.push({message:dictionary.errors.fileDeleteError,path:pathToFile,error:error.message});
        }
      }
    }
    if (!contentOnly) {
      try {
        fs.rmdirSync(path);
      } catch (error) {
        result.push({message:dictionary.errors.folderDeleteError,path:path,error:error.message});
      }
    }
	}
  return result;
}

export const readFiles = (path,fileNames) =>
{
  let result="";
  for (let i = 0; i < fileNames.length; i++) {
    let content;
    try {
      content = fs.readFileSync(path+"/"+fileNames[i],'utf8');
    } catch (e) {
    }
    if (content) {
      result+=content+"\n";
    } else {
      // console.log("Unable to read file:", path+"/"+fileNames[i]);
    }
  }
  if (result==="") {
    result=null;
  }
  return result;
}

export const readFile = (path) =>
{
  let result="";
  let content;
  try {
    content = fs.readFileSync(path,'utf8');
  } catch (e) {
  }
  if (content) {
    result=content;
  } else {
    // console.log("Unable to read file:", path+"/"+fileNames[i]);
  }
  if (result==="") {
    result=null;
  }
  return result;
}

export const writeFile = (path,data) =>
{
  try {
    fs.writeFileSync(path,data);
  } catch (e) {
    return false;
  }
  return true;
}

export const readFilesFromPaths = (pathes,fileNames) =>
{
  let result="";
  for (let i = 0; i < fileNames.length; i++) {
    let content;
    for (let j = 0; j < pathes.length; j++) {
      try {
        content = fs.readFileSync(pathes[j]+"/"+fileNames[i],'utf8');
      } catch (e) {
      }
      if (content) {
        result+=content+"\n";
        break;
      }
    }
    if (!content) {
      // console.log("Unable to read file:", fileNames[i]);
    }
  }
  if (result==="") {
    result=null;
  }
  return result;
}


export const execProcess = (commandPath,callback) =>
{
  commandPath=commandPath.replace(/\//gi,"\\");
  let childProcess = shelljs.exec(commandPath,{async:true},(error) => {
    callback(error);
  });
  return childProcess;
}

export const collectFiles = (files,destination,callback) =>
{
  if (objectIsEmpty(files)) {
    setTimeout(() => {callback()},0);
    return;
  }

// TODO: Сделать несколько попыток записи файла

  (async () => {
    let errors=[];
    for (let file in files) {
      makeDir(getFilePath(destination+"/"+file));
        try {
          await fsExtra.copy(files[file], destination+"/"+file);
        } catch (error) {
          errors.push(error);
        }
    }
    if (errors.length==0) errors=null;
    callback(errors);
  })();
}

export const getFileSize = (path) =>
{
  let size;
  try {
    let stats=fs.statSync(path);
    size=stats.size;
  } catch (e) {
    size=null;
  }
  return size;
}

const _getFolderSize = (path) =>
{
  // console.log("!Path:",path);
  let files = fs.readdirSync(path);
  let size=0;
  // console.log(files);
  // for (let i in files){
  for (let i = 0; i < files.length; i++) {
    let name=path+"/"+files[i];
    // console.log("??????????????!!!!NAME!",name);
    let stats=fs.statSync(name);
    if (stats.isDirectory()){

        // console.log("!Path:",name);

        size+=_getFolderSize(name);
    } else {
        size+=stats.size;
    }
  }
  return size;
}

export const getFolderSize = (path) =>
{
  let size;
  try {
    size=_getFolderSize(path);
  } catch (e) {
    // console.log("?!!!!!!!!!!!",e);
    size=null;
  }
  return size;
}

export const searchFileInPathes = (fileName,pathes) =>
{
  for (let i = 0; i < pathes.length; i++) {
    let path=pathes[i]+"/"+fileName;
    let fileExists = false;
    try {
      fs.accessSync(path, fs.constants.F_OK);
      fileExists=true;
    } catch (e) {
    }
    if (fileExists) return path;
  }
  return null;
}
