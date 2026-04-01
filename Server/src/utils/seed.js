import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Setup __dirname for ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

// Models
import User from '../models/User.js';
import Reel from '../models/Reel.js';
import Notification from '../models/Notification.js';

// Dummy users data
const RAW_USERS = [
    { 
        name: 'Arjun Sharma',    
        username: 'arjun_goals',   
        email: 'arjun@sportvibe.com',  
        location: 'Kolkata, India',    
        sport: 'football',   
        bio: '⚽ Football player & content creator. West Bengal State League.' 
    },
    { 
        name: 'Priya Rajan',     
        username: 'priya_cricket', 
        email: 'priya@sportvibe.com',  
        location: 'Mumbai, India',     
        sport: 'cricket',    
        bio: '🏏 Cricketer · National U-19 Player. Batting is life.' 
    },
    { 
        name: 'Carlos Mendez',   
        username: 'carlos_f1',     
        email: 'carlos@sportvibe.com', 
        location: 'Barcelona, Spain',  
        sport: 'formula1',   
        bio: '🏎️ Formula 1 analyst · Speed freak · Monza lap record holder.' 
    },
    { 
        name: 'Mia Torres',      
        username: 'mia_ace',       
        email: 'mia@sportvibe.com',    
        location: 'Paris, France',     
        sport: 'tennis',     
        bio: '🎾 Tennis pro · WTA ranked · Grand Slam dreams.' 
    },
    { 
        name: 'Dev Kumar',       
        username: 'dev_swim',      
        email: 'dev@sportvibe.com',    
        location: 'Sydney, Australia', 
        sport: 'swimming',   
        bio: '🏊 Olympic hopeful · Butterfly specialist.' 
    },
    { 
        name: 'Sofia Kovalenko', 
        username: 'sofia_boxing',  
        email: 'sofia@sportvibe.com',  
        location: 'Moscow, Russia',    
        sport: 'boxing',     
        bio: '🥊 Discipline over motivation. 5 AM every day.' 
    },
    { 
        name: 'Anya Petrov',     
        username: 'anya_runs',     
        email: 'anya@sportvibe.com',   
        location: 'Nairobi, Kenya',    
        sport: 'athletics',  
        bio: '🏃 Marathon runner · PB chaser · Nairobi AC.' 
    },
    { 
        name: 'Jay Thompson',    
        username: 'jay_vibes',     
        email: 'jay@sportvibe.com',    
        location: 'London, UK',        
        sport: 'basketball', 
        bio: '🏀 Hoops & highlights. London Lions fan forever.' 
    },
];

// Reel Templates:  [ userIdx, sport, videoType, title, caption, tags ]
const REEL_TEMPLATES = [
    [
        0, 
        'football',   
        'sports',  
        'Last-Minute Winner 🔥',        
        'What a goal to end the game! Pure instinct.',                          
        ['football','goals','highlights']
    ],
    [
        0, 
        'football',   
        'sports',  
        'Bicycle Kick Tutorial',         
        'Step-by-step guide to the perfect bicycle kick.',                     
        ['football','skills','tutorial']
    ],
    [
        1, 
        'cricket',    
        'sports',  
        'Century Alert! 🏏',             
        'First century of the season. Absolutely speechless!',                 
        ['cricket','century','batting']
    ],
    [
        1, 
        'cricket',    
        'sports',  
        'Perfect Cover Drive',           
        'The timing makes all the difference. Watch the wrist action.',        
        ['cricket','batting','technique']
    ],
    [
        2, 
        'formula1',   
        'sports',  
        'Lap Record Broken 🏎️',          
        'New lap record at Monza! Engineering at its finest.',                 
        ['formula1','racing','laprecord']
    ],
    [
        2, 
        'formula1',   
        'sports',  
        'Fastest Lap Breakdown',         
        'Breaking down every corner of the fastest lap.',                     
        ['formula1','analysis','motorsport']
    ],
    [
        3, 
        'tennis',     
        'sports',  
        'Serve at 220 km/h ⚡',           
        'The secret is the trophy position. Watch in slow-mo.',               
        ['tennis','serve','technique']
    ],
    [
        3, 
        'tennis',     
        'sports',  
        'Match Point Ace',               
        'Championship point, nerves of steel, clean ace down the T.',         
        ['tennis','ace','matchpoint']
    ],
    [
        4, 
        'swimming',   
        'sports',  
        '100m Butterfly — Personal Best',
        'Dropped 0.8s off my PB. Dolphin kicks are everything.',              
        ['swimming','butterfly','personalbest']
    ],
    [
        4, 
        'swimming',   
        'sports',  
        'Flip Turn Masterclass',         
        'The flip turn is where races are won and lost.',                      
        ['swimming','technique','flipturn']
    ],
    [
        5, 
        'boxing',     
        'sports',  
        'Training Day 💪',                
        '5 AM session. Discipline beats motivation every day.',               
        ['boxing','training','discipline']
    ],
    [
        6, 
        'basketball', 
        'sports',  
        'Crossover That Broke Ankles 🏀',
        'Defender had no idea. Practice this crossover daily.',              
        ['basketball','crossover','skills']
    ],
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Success...');

        // Clear everything
        await Promise.all([
            User.deleteMany({}),
            Reel.deleteMany({}),
            Notification.deleteMany({}),
        ]);
        console.log('Cleared existing data successfully...');

        // Create users
        const password = await bcrypt.hash('Password123!', 12);
        const users = await User.insertMany(
            RAW_USERS.map(u => ({ ...u, password, isVerified: true }))
        );

        // Log created users
        console.log(`Created ${users.length} users....`);

        // Create reels
        const r2Base = (process.env.R2_PUBLIC_URL).replace(/\/$/, '');
        const sportCounter = {};
        const reelDocs = [];

        // Loop through templates and create reels
        for (const [uIdx, sport, videoType, title, caption, tags] of REEL_TEMPLATES) {
            sportCounter[sport] = (sportCounter[sport] || 0) + 1;
            const n = sportCounter[sport];
            reelDocs.push({
                user: users[uIdx]._id,
                title,
                caption,
                videoUrl: `${r2Base}/videos/seed/${sport}_${n}.mp4`,
                videoKey: `videos/seed/${sport}_${n}.mp4`,
                thumbnailUrl: '',
                sport,
                videoType,
                tags,
                location: users[uIdx].location,
                views: Math.floor(Math.random() * 50000) + 500,
                shares: Math.floor(Math.random() * 1000),
                duration: Math.floor(Math.random() * 120) + 30,
                isPublished: true,
            });
        }

        // Insert reels and log results
        const createdReels = await Reel.insertMany(reelDocs);
        console.log(`Created ${createdReels.length} reels...`);

        // Add likes (2–5 random users per reel)
        await Promise.all(
            createdReels.map(reel => {
                const likers = users
                    .filter(u => u._id.toString() !== reel.user.toString())
                    .sort(() => Math.random() - 0.5)
                    .slice(0, Math.floor(Math.random() * 4) + 2)
                    .map(u => u._id);
                return Reel.findByIdAndUpdate(reel._id, { $set: { likes: likers } });
            })
        );

        // Log likes added
        console.log('Added likes...');

        // Add follow relationships
        await Promise.all(
            users.flatMap((user, i) => {
                const targets = [
                    users[(i + 1) % users.length]._id,
                    users[(i + 2) % users.length]._id,
                    users[(i + 3) % users.length]._id,
                ];
                return [
                    User.findByIdAndUpdate(user._id, { $set: { following: targets } }),
                    ...targets.map(tid => User.findByIdAndUpdate(tid, { $addToSet: { followers: user._id } })),
                ];
            })
        );

        // Update reelsCount per user
        await Promise.all(
            users.map(u => {
                const count = createdReels.filter(r => r.user.toString() === u._id.toString()).length;
                return User.findByIdAndUpdate(u._id, { reelsCount: count });
            })
        );

        // Log follow relationships added
        console.log('Added follow relationships...');

        // Add comments to first 4 reels
        const commenters = [users[1], users[2], users[3], users[4]];
        await Promise.all(
            commenters.map((commenter, i) =>
                Reel.findByIdAndUpdate(createdReels[i]._id, {
                    $push: { comments: { user: commenter._id, text: 'Incredible form! 🔥 Keep it up!' } },
                })
            )
        );

        // Log comments added
        console.log('Added comments...');

        // Create notifications
        const notifications = [];

        // Like notifications == 8
        for (let i = 0; i < 8; i++) {
            const reel   = createdReels[i];
            const sender = users[(i + 1) % users.length];
            if (sender._id.toString() === reel.user.toString()) continue;
            notifications.push({
                recipient: reel.user,
                sender: sender._id,
                type: 'like',
                reel: reel._id,
                message: `${sender.name} liked your reel "${reel.title}"`,
                isRead: i > 4,
            });
        }

        // Follow notifications == 4
        for (let i = 0; i < 4; i++) {
            const sender = users[(i + 4) % users.length];
            notifications.push({
                recipient: users[i]._id,
                sender: sender._id,
                type: 'follow',
                message: `${sender.name} started following you`,
                isRead: i > 1,
            });
        }

        // Comment notifications == 4
        for (let i = 0; i < 4; i++) {
            const reel   = createdReels[i];
            const sender = users[(i + 2) % users.length];
            if (sender._id.toString() === reel.user.toString()) continue;
            notifications.push({
                recipient: reel.user,
                sender: sender._id,
                type: 'comment',
                reel: reel._id,
                message: `${sender.name} commented: "Incredible form, Keep it up!"`,
                isRead: false,
            });
        }

        // Mention notifications (3)
        for (let i = 0; i < 3; i++) {
            const sender = users[(i + 5) % users.length];
            notifications.push({
                recipient: users[i]._id,
                sender: sender._id,
                type: 'mention',
                message: `${sender.name} mentioned you in a comment`,
                isRead: false,
            });
        }

        // Insert notifications and log results
        await Notification.insertMany(notifications);
        console.log(`Created ${notifications.length} notifications...`);

        // ── Final summary ─────────────────────────────────────
        console.log('\n✅ Seed complete!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔑 Test credentials (same for all users)');
        console.log('Password: Password123!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Emails:');
        users.forEach(u => console.log(`${u.email}`));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎬 R2 video files to upload under videos/seed/:');
        const keys = [...new Set(createdReels.map(r => r.videoKey))].sort();
        keys.forEach(k => console.log(`${k}`));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // exit successfully
        process.exit(0);

    } catch (err) {
        console.error('Seed failed:', err.message);
        console.error(err);
        process.exit(1);
    }
}

// invoke
seed();