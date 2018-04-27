class LogExtension{
    static debugEnabled = false;
    public static log(value: any, obj?: any) {
        if (LogExtension.debugEnabled) {
            if (window.console) {
                console.log(value);
                if (obj != null) {
                    console.log(obj);
                }
            }
        }
    }
}