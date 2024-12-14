type WebViewMessage =
|{
type: string;
data: {};
}
|{
    type: string;
    data: {
        posd: string, timed: string, moved: string
    }
};

export default WebViewMessage;