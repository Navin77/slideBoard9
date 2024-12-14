import { Devvit } from '@devvit/public-api';

// Configure Devvit's plugins
Devvit.configure({
  redditAPI: true,
});

// Adds a new menu item to the subreddit allowing to create a new post
Devvit.addMenuItem({
  label: 'create slideBoard9 game',
  location: 'subreddit',
  // forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui, redis } = context;
    var sNo = await redis.get('postSerialNumber')
    if(sNo == undefined)
    {
      sNo = "1"
      await redis.set('postSerialNumber', "1")
    } else {
      sNo = `${Number(sNo)+1}`;
      await redis.set('postSerialNumber', sNo)
    }
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit. submitPost({
      title: `slideBoard9 #${sNo}`,
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    ui.showToast({ text: 'Created game' });
    ui.navigateTo(post);
  },
});
