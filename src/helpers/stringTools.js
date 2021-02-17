export const getIsImageFileName = (data) => {
  if (data.match(/\.(gif|jpg|jpeg|svg|png)$/gim)) {
    return true;
  }
  return false;
}

export const getImageType = (data) => {
  let result=(/\.(gif|jpg|jpeg|svg|png)$/gim).exec(data);
  if (result) {
    return result[1];
  }
  return null;
}

export const getFilePath = (data) => {
  let regExp=/(.+[\\\/]|^)*(?:.+?)$/gim;
  let match=regExp.exec(data);
  if (match) {
    return match[1];
  }
  return null;
}

export const getFileName = (data) => {
  let regExp=/(?:.+[\\\/]|^)*(.+?)(?:\.[^.]*$|$)/gim;
  let match=regExp.exec(data);
  if (match) {
    return match[1];
  }
  return null;
}

export const getFileExt = (data) => {
  let regExp=/\.([^.]*?)(?=\?|#|$)/gim;
  let match=regExp.exec(data);
  if (match) {
    return match[1];
  }
  return null;
}

export const getFileNameExt = (data) => {
  let regExp=/(?:.+[\\\/]|^)*(.+?)$/gim;
  let match=regExp.exec(data);
  if (match) {
    return match[1];
  }
  return null;
}

export const getMatches = (regexp,data,matchCount) =>
{
  let matchArray;
  let result = [];
  while ((matchArray = regexp.exec(data)) !== null) {
    if (!matchCount) {
      result.push(matchArray[1]);
    } else {
      let matches=[];
      for (let i = 1; i <= matchCount; i++) {
        matches.push(matchArray[i]);
      }
      result.push(matches);
    }
  }
  return result;
}

export const split = (source) =>
{
  let result=[];
  if (source) {
    result=source.split(/\s*,\s*/);
    // for (let i = 0; i < parseArray.length; i++) {
    //   result.push(String(parseArray[i]).trim());
    // }
  }
  return result;
}

export const replaceObject = (object,data) => {
  if (data) {
    for (let name in object) {
      let regExp = new RegExp(name,"g");
      data=data.replace(regExp,object[name]);
    }
  } else {
    data="";
  }
  return data;
}
