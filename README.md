# Replay Server
This is the code for the replay server I built at [staraptorshowdown.com/replays](https://staraptorshowdown.com/replays) \
You will need to make some edits detailed below, but it should be pretty close to working out of the box \
Ping me on discord (staraptorop) if you have any questions!

Everything assumes this folder is at the same level at the server and client

```
├── pokemon-showdown
│   ├── logs
├── pokemon-showdown-client
│   ├── play.pokemonshowdown.com
│   |   └── replays
├── replay-server
│   ├── replay_runner.sh
│   └── README.md
```

## Server Setup
- I would highly recommend setting `exports.logchallenges = true` in `pokemon-showdown/config/config.js`
- Next, play a game and then ensure there is at least 1 log file in `pokemon-showdown/logs`
- Optional but highly recommended:
  - Check Lines 855 - 878 of [server/room-battle.ts](https://github.com/ShivaD173/pokemon-showdown/blob/master/server/room-battle.ts)
  - This ensures any privated game will not generate a replay
  - It also pastes the link in the chat immediately at the end of the game

## Nginx Setup
Ensure your `pokemon-showdown-client` nginx config has this inside it \
You should already have something that looks similar, but check the `index` and `autoindex`
```nginx
    location / {
        root /var/www/pokemon-showdown-client/play.pokemonshowdown.com/;
        index index.html;
        autoindex on;
    }
```

**NOTE**: This assumes your main server is hosted at `index.html`.  \
If your server is hosted at `testclient-old.html` (noted by `index testclient-old.html`) in the above config, you can rename `index.html` in this folder to `testclient-old.html` \
Then add this these lines to your `vite.config.ts:11`
```ts
      input: {
        client: 'testclient-old.html',
      },
```


## Code Edits
- Change `replay_embed_location` in `generate_replays.py:7`
  - Using `"https://play.pokemonshowdown.com/js/replay-embed.js"` will work but will not use your new sprites or stats
  - I'd recommend using your own server's `js/replay-embed.js`
    - Ensure your link is in the `linkStyle` and `requireScript` instead of `play.pokemonshowdown.com`
  - If you do not have custom sprites, you only need to overwrite certain lines like [staraptorshowdown.com/js/replay-embed.js](https://staraptorshowdown.com/js/replay-embed.js)
- Change `server_location` in `generate_csv.py:6`
- Change the Title in `App.tsx:49`


## Replay Webpage
- Typescript webpage built with React/Mui based on csv created from above
```bash
npm ci
npm run build
```
- If all above is set correctly, you should be able to go to `https://{your_server_name}/replays` and a blank page should show up saying *Loading replays...*

## Generating Replays
- Scripts that generate replays from log files
```bash
pip install pokemon-showdown-replays
python generate_replays.py
python generate_csv.py
```
- If this is done correctly replays should show up on the above link
- Note that this only generates replays for files that don't exist, so if you mess up your setup, delete the old replays for it to regenerate

## Replay Runner
- Watches `pokemon-showdown/logs` folder and runs the above 2 python files
- Run with `bash replay_runner.sh`
- I recommend leaving this running in a tmux window or some other way to keep in running even after you close out


# Todo in the future
Export to clipboard \
Replay Scouter
