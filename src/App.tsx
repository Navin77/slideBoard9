import { Devvit, useAsync, useState } from '@devvit/public-api';
import WebViewMessage from './webviewMsg.js';


const App: Devvit.CustomPostComponent = (ctx) => {

    const [appDat] = useState(async () => {
         let a = ctx.reddit.getCurrentUser()
         let b = ctx.redis.get(`${ctx.postId}_authorName`)
         let c = await Promise.all([a,b])
         //if no author Name, then its 1st time, store authorname & page1
         if(c[1] == undefined) {
             await ctx.redis.set(`${ctx.postId}_page`, "1");
             await ctx.redis.set(`${ctx.postId}_authorName`, c[0].username);
             return [c[0].username, c[0].username]
         }
         return [c[0].username, c[1]]
         
    })

    const [webviewVisible, setWebviewVisible] = useState(false);

    const onShowWebviewClick = () => {
        setWebviewVisible(true);
        ctx.ui.webView.postMessage('myWebView', {
            type: 'initial',
            data: {
                usrName: appDat[0],
                authorName:  appDat[1],
            }
        })
    };

    const onMessage = async (msg:WebViewMessage) => {
        switch (msg.type) {
            case "whatPageAuthor": {
                let page = await ctx.redis.get(`${ctx.postId}_page`);
                
                if (page == "1") {
                ctx.ui.webView.postMessage('myWebView', {
                    type: 'AnspageAuthor',
                    data: page
                })
                } else {
                    let posd = await ctx.redis.get(`${ctx.postId}_sqPos`)
                    let timed = await ctx.redis.get(`${ctx.postId}_sqTime`)
                    let moved = await ctx.redis.get(`${ctx.postId}_sqMove`)
                    let scores = await ctx.redis.get(`${ctx.subredditId}_scores`);
                    let scoresd = [];

                    //get first 5 scores
                    if (scores != undefined) {
                        scoresd = first5Scores(scores)
                    }

                    ctx.ui.webView.postMessage('myWebView', {
                        type: 'AnspageAuthor',
                        data: [posd, timed, moved, scoresd]
                    })
                }
            }
            break;
            case "whatPageOther": {
                let page = await ctx.redis.get(`${ctx.postId}_page`);
                if(page == "1") {
                ctx.ui.webView.postMessage('myWebView', {
                    type: 'AnspageOther',
                    data: page
                })
               } else {
                    let posd = await ctx.redis.get(`${ctx.postId}_sqPos`)
                    let timed = await ctx.redis.get(`${ctx.postId}_sqTime`)
                    let moved = await ctx.redis.get(`${ctx.postId}_sqMove`)
                    let completed = "false"
                    let playedUsr = await ctx.redis.get(`${ctx.postId}_completed`)
                    let scores = await ctx.redis.get(`${ctx.subredditId}_scores`);
                    let scoresd = []
                    let uScoresd = []

                    //check if usr is completed
                    if(playedUsr != undefined)
                    {
                        let usrs = playedUsr.split(",");
                        for (let i = 0; i < usrs.length; i++) {
                            if(appDat[0] == usrs[i])
                            {
                                completed = "true"
                                break;
                            }
                        }
                    }

                    //get 1st 5 scores & currUsrScore
                    if (scores != undefined) {
                        scoresd = first5Scores(scores)
                        let isIn1st5 = scoresd.indexOf(appDat[0])

                       if(isIn1st5 == -1)
                       {
                           let scr = scores.split(",")
                           let usrIdx = scr.indexOf(appDat[0]);
                           if (usrIdx != -1) {
                               uScoresd.push(scr[usrIdx])
                               uScoresd.push(scr[usrIdx + 1])
                           }
                       }

                    }

                    ctx.ui.webView.postMessage('myWebView', {
                        type: 'AnspageOther',
                        data: [posd, timed, moved, completed, scoresd, uScoresd]
                    })
               }
            }
            break;
            case "storePuzData": {
                await ctx.redis.set(`${ctx.postId}_sqPos`, msg.data.posd)
                await ctx.redis.set(`${ctx.postId}_sqTime`, msg.data.timed)
                await ctx.redis.set(`${ctx.postId}_sqMove`, msg.data.moved)
                await ctx.redis.set(`${ctx.postId}_page`, "2");
                let scores = await ctx.redis.get(`${ctx.subredditId}_scores`);
                let scoresd = [];

                //get first 5 scores
                if (scores != undefined) {
                    scoresd = first5Scores(scores)
                }

                ctx.ui.webView.postMessage('myWebView', {
                    type: 'AnspageAuthor',
                    data: [msg.data.posd, msg.data.timed, msg.data.moved, scoresd]
                })
            }
            break;
            case "won": {
                // add usr to completed
                let wonUsrs = await ctx.redis.get(`${ctx.postId}_completed`);
                if(wonUsrs == undefined)
                {
                    await ctx.redis.set(`${ctx.postId}_completed`, appDat[0]);
                } else
                {
                    wonUsrs += `,${appDat[0]}`
                }
                //update scores
                let scores = await ctx.redis.get(`${ctx.subredditId}_scores`);
                if (scores == undefined)
                {
                    await ctx.redis.set(`${ctx.subredditId}_scores`, `${appDat[0]},1`);
                    ctx.ui.webView.postMessage('myWebView', {
                        type: 'afterWonScores',
                        data: [[appDat[0], "1"],[]]
                    })
                } else {

                    let s = scores.split(",");
                    let sIdx = s.indexOf(appDat[0])
                    let scoresd = []
                    let uScoresd = []

                    if(sIdx != -1) {

                        let n = Number(s[sIdx + 1]) + 1;
                        s[sIdx + 1] = `${n}`
                        let newS = getSortedScore(s);
                        await ctx.redis.set(`${ctx.subredditId}_scores`, newS);
                        scoresd = first5Scores(newS)
                        if(scoresd.indexOf(appDat[0]) == -1)
                        uScoresd = [s[sIdx], s[sIdx + 1]]

                    } else {
                    scores += `,${appDat[0]},1`
                    scoresd = first5Scores(scores)

                    if (scoresd.indexOf(appDat[0]) == -1)
                    uScoresd = [appDat[0] , "1"]
                
                    await ctx.redis.set(`${ctx.subredditId}_scores`, scores);
                    }

                    ctx.ui.webView.postMessage('myWebView', {
                        type: 'afterWonScores',
                        data: [scoresd, uScoresd]
                    })
                }
            }
            break;
            default:
                break;
        }
    };

    return (
        <vstack grow padding="small">
        {!webviewVisible && (<vstack
          grow
          height='100%'
          alignment="center middle"
          gap='medium'>
            <image url="launch.png" imageWidth={120} imageHeight={120} />
            <spacer size="medium" />
            <text size="xlarge" weight="bold">SlideBoard9</text>
            <text size="xlarge">
                move the numbered square to solve puzzle
             </text>
            <spacer/>
            <button onPress={onShowWebviewClick}>Launch Game</button>
        </vstack>)}

        {webviewVisible && (<vstack grow height='100%'>
          <vstack border="thick" borderColor="black" height='100%'>
            <webview
              id="myWebView"
              url="page.html"
              onMessage={(msg) => onMessage(msg as WebViewMessage)}
              grow
              height='100%'
            />
          </vstack>
        </vstack>)}
      </vstack>

)};

// a = "name,55"
function first5Scores(a) {
    let scoresd = []

    let scr = a.split(",")
    let oLen = 10;

    if (scr.length < 10)
        oLen = scr.length

    for (let i = 0; i < oLen; i++) {
        scoresd.push(scr[i])
    }

    return scoresd
}

// a = ["name", "5"]
function getSortedScore(a) {
    let b = [];
    let d = ""
    for (let i = 0; i < a.length; i=i+2) {
        let c = [a[i], a[i+1]]
        b.push(c);
    }

    b.sort((i,j)=>{
        return Number(j[1]) - Number(i[1])
    })


    for (let j = 0; j < b.length; j++) {
        if(j == 0)
            d += `${b[j][0]},${b[j][1]}`
        else
            d += `,${b[j][0]},${b[j][1]}`
    }
    return d;
}

export default App