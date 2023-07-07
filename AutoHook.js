console.log("reload");
var Color = {
    RESET: "\x1b[39;49;00m", Black: "0;01", Blue: "4;01", Cyan: "6;01", Gray: "7;11", Green: "2;01", Purple: "5;01", Red: "1;01", Yellow: "3;01",
    Light: {
        Black: "0;11", Blue: "4;11", Cyan: "6;11", Gray: "7;01", Green: "2;11", Purple: "5;11", Red: "1;11", Yellow: "3;11"
    }
};
        
function LOG(input, kwargs) {
    kwargs = kwargs || {};
    var logLevel = kwargs['l'] || 'log', colorPrefix = '\x1b[3', colorSuffix = 'm';
    if (typeof input === 'object')
        input = JSON.stringify(input, null, kwargs['i'] ? 2 : null);
    if (kwargs['c'])
        input = colorPrefix + kwargs['c'] + colorSuffix + input + Color.RESET;
    console[logLevel](input);
};

function printBacktrace() {
    Java.perform(function() {
        var android_util_Log = Java.use('android.util.Log'), java_lang_Exception = Java.use('java.lang.Exception');
    
        LOG(android_util_Log.getStackTraceString(java_lang_Exception.$new()), { c: Color.Gray });
    });
};

function isDstBacktrace(str){
    
    var android_util_Log = Java.use('android.util.Log'), java_lang_Exception = Java.use('java.lang.Exception');
    if(android_util_Log.getStackTraceString(java_lang_Exception.$new()).includes(str)){
        return true;
    }
    return false;
       
   
}

function printCV(contentValues){
    var Set = Java.use("java.util.Set");
    var ContentValues = Java.use("android.content.ContentValues");
    var values = Java.cast(contentValues,ContentValues);
    var sets = Java.cast(values.keySet(),Set);
    var arr = sets.toArray().toString().split(",");
    for(var i = 0;i<arr.length;i++){
        console.log(arr[i] + ", " + values.get(arr[i]));
    }
}
function byte2hexstr(bytes){
    var ByteString = Java.use("com.android.okhttp.okio.ByteString");
    var hexStr = ByteString.of(bytes).hex();
    return hexStr;
}

class autoHoo{
    olMap = new Map([['char[]','[C'],['byte[]','[B']]);
    function2Str(tFunction){
        var funcStr = tFunction.toString();
        var index1 = funcStr.indexOf("function(){");
        var index2 = funcStr.lastIndexOf("}");
        return funcStr.substring(index1+11,index2);
    }
    parseClassName(){
        var r = this.inputStr.indexOf("(");
        r = this.inputStr.substring(0,r).lastIndexOf(".");
        return this.inputStr.substring(0,r);
    }
    parseFunctionName(){
        var r = this.inputStr.indexOf("(");
        var l = this.inputStr.substring(0,r).lastIndexOf(".") + 1;
        return this.inputStr.substring(l,r);
    }
    parseOverloads(){
        var l = this.inputStr.indexOf("(") + 1;
        var r = this.inputStr.lastIndexOf(")");
        var rawOverloadStr = this.inputStr.substring(l,r);
        var overloads = rawOverloadStr.split(",");
        for(var i = 0;i<overloads.length;i++){
            if(this.olMap.has(overloads[i])){
                overloads[i] = this.olMap.get(overloads[i]);
            }
        }
        return overloads;
    }
    isHasRet(){
        return this.inputStr.indexOf("void") == -1?true:false;
    }
    buildArgsStr(argsNum){
        var argsStr = "";
        for(var i = 0;i<argsNum;i++){
            argsStr += "args" + i + ",";
        }
        return argsStr.substring(0,argsStr.length-1)
    }
   

    constructor(tInputStr, tFunction){
        this.inputStr = tInputStr.replace(/\s*/g,"");
        var tClassName = this.parseClassName();
        var tFunctionName = this.parseFunctionName();
        var tOverloads = this.parseOverloads();
       
        var Clz = Java.use(tClassName);
        var func = Reflect.get(Clz,tFunctionName).overload(...tOverloads);
        var that = this;
        func.implementation = function(...args){
            if(that.isHasRet()){
                var res = func.call(this,...args);
                tFunction(res,...args);
                return res;
            }else{
                func.call(this,...args);
                tFunction(...args);
                return;
            }
        }
        
    }
}

Java.perform(function(){     
    new autoHoo("com.xxx.xxx.app.SQLiteDatabase.xxx(java.lang.String, java.lang.String, android.content.ContentValues) : long",(res,...args)=>{
        console.log(args[0]);
        console.log(res);
    })   
});

