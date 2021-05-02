import desert from './images/desert.jpg';
import island from './images/island.png';
import living from './images/living-room.jpg';
import ship from './images/ship-sailing.jpg';
import man from './images/man-bench.jpg';
import plant from './images/plant-biology.jpg';
import tRex from './images/t-rex.jpg'
import levelUp from './images/levelUp.PNG'
import hero from './images/hero.jpg'


export const Dummy = {
    story : {
        's0' : {
            title: 'Treasure Hunt',
            contributor: ['user', 'admin'],
            likes: 14,
            nodecount: 2,
            nodes: {
                'n0' : {
                    author: 'user',
                    date:'June.5 2017',
                    content: 'Jerry was an ordinary boy in every way, being someone who lived in rural...',
                    img: island,
                    follow: true,
                    options: [[1, 'You choose option 1'], [2, 'You choose option 2']],

                },
                'n1' : {
                    author: 'admin',
                    date:'June.6 2017',
                    content: 'First node of Threasure Hunt',
                    img: island,
                    follow: true,
                    options: [[3, 'You choose option 1'], [4, 'You choose option 2']],
                },
                'n2' : {
                    author: '',
                    date:'',
                    content: '',
                    img: island,
                    follow: false,
                    options: [],
                },
                'n3' : {
                    author: '',
                    date:'',
                    content: '',
                    img: island,
                    follow: false,
                    options: [],
                },
                'n4' : {
                    author: '',
                    date:'',
                    content: '',
                    img: island,
                    follow: false,
                    options: [],
                },

            }
        },
        's1' : {
            title: 'My Favourite Ghost Cat',
            contributor: ['admin'],
            likes: 66,
            nodecount: 1,
            nodes: {
                'n0' : {
                    author: 'admin',
                    date:'June.5 2017',
                    content: 'August 29th, 2005 was a day few remember, but...',
                    img: living,
                    follow: true,
                    options: [[1, 'You choose option 1'], [2, 'You choose option 2']],

                },
                'n1' : {
                    author: '',
                    date:'',
                    content: '',
                    img: living,
                    follow: false,
                    options: [],
                },
                'n2' : {
                    author: '',
                    date:'',
                    content: '',
                    img: living,
                    follow: false,
                    options: [],
                },

            }
        },
        's2' : {
            title: 'Cold Summer Times',
            contributor: ['admin'],
            likes: 42,
            nodecount: 1,
            nodes: {
                'n0' : {
                    author: 'user',
                    date:'June.5 2017',
                    content: "One man's trash is another man's treasure, as they say. Ben was...",
                    img: desert,
                    follow: true,
                    options: [[1, 'You choose option 1'], [2, 'You choose option 2']],

                },
                'n1' : {
                    author: '',
                    date:'',
                    content: '',
                    img: desert,
                    follow: false,
                    options: [],
                },
                'n2' : {
                    author: '',
                    date:'',
                    content: '',
                    img: desert,
                    follow: false,
                    options: [],
                },

            }
        },
        's3' : {
            title: 'Ocean Horror',
            contributor: ['user'],
            likes: 9,
            nodecount: 1,
            nodes: {
                'n0' : {
                    author: 'user',
                    date:'June.5 2017',
                    content: "The Titanic. Just about everyone's heard about it, but I'm hear to present...",
                    img: ship,
                    follow: true,
                    options: [[1, 'You choose option 1'], [2, 'You choose option 2']],
                },
                'n1' : {
                    author: '',
                    date:'',
                    content: '',
                    img: ship,
                    follow: false,
                    options: [],
                },
                'n2' : {
                    author: '',
                    date:'',
                    content: '',
                    img: ship,
                    follow: false,
                    options: [],
                },

            }
        },
        's4' : {
            title: 'A Gigavolt Battery',
            contributor: ['user'],
            likes: 70,
            nodecount: 1,
            nodes: {
                'n0' : {
                    author: 'user',
                    date:'June.5 2017',
                    content: 'It was my third-year in university, and I was constantly searching for some part-time...',
                    img: man,
                    follow: true,
                    options: [[1, 'You choose option 1'], [2, 'You choose option 2']],
                },
                'n1' : {
                    author: '',
                    date:'',
                    content: '',
                    img: man,
                    follow: false,
                    options: [],
                },
                'n2' : {
                    author: '',
                    date:'',
                    content: '',
                    img: man,
                    follow: false,
                    options: [],
                },

            }
        },
        's5' : {
            title: 'The Money Tree',
            contributor: ['user'],
            likes: 45,
            nodecount: 1,
            nodes: {
                'n0' : {
                    author: 'user',
                    date:'June.5 2017',
                    content: 'I remember that high school day so clearly. I was in my biology class waiting for the bell...',
                    img: plant,
                    follow: true,
                    options: [[1, 'You choose option 1'], [2, 'You choose option 2']],
                },
                'n1' : {
                    author: '',
                    date:'',
                    content: '',
                    img: plant,
                    follow: false,
                    options: [],
                },
                'n2' : {
                    author: '',
                    date:'',
                    content: '',
                    img: plant,
                    follow: false,
                    options: [],
                },

            }
        },

    },
    user: {
        'user': {
            username : 'user',
            password : 'user',
            contributions: [0, 2, 3, 4, 5],
            level: 1,
            joined: 'January 10, 2021',
            points: 200,
            likes: [],
            avatar: tRex,

        },
        'admin': {
            username : 'admin',
            password : 'admin',
            contributions: [0, 1, 2],
            level: 10,
            joined: 'January 1, 2021',
            points: 200,
            likes: [],
            avatar: hero,
        },
    },
    shop: {
        'Avatar': [
            ['T-rex Avatar', tRex, 20],
            ['Hero Avatar', hero, 10]
          ],
        'Levels': [
            [1, levelUp, 10],
            [10, levelUp, 100]
        ]
    },

}
