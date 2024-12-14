import './createPost.js';
import App from './App.js'

import { Devvit} from '@devvit/public-api';

Devvit.configure({
    redditAPI: true,
    redis: true,
});

//add your custom post
Devvit.addCustomPostType({
    name: 'SlideBoard9',
    description: 'move numbered squares to solve',
    height: 'tall', //'regular 320px' 'tall 512px'
    render: App,
});

export default Devvit;
