from pokemon_showdown_replays import Replay, Download
import json
import os
import re
from collections import defaultdict

replay_embed_location="https://staraptorshowdown.com/js/replay-embed.js"
subfolders = [f.path for f in os.scandir(
    "../pokemon-showdown/logs/") if f.is_dir() and f.path[-3] == "-"]
# Only grabs last 2 months to avoid regenerating replays for old months
subfolders = sorted(subfolders)[-2:]
log_json_dict = defaultdict(list)


for dir in subfolders:
    if "-" in dir:
        format_folders = [f.path for f in os.scandir(dir) if f.is_dir()]
        for format_folder in format_folders:
            format = format_folder.split("/")[-1]
            day_folders = [f.path for f in os.scandir(
                format_folder) if f.is_dir()]
            for day_folder in day_folders:
                log_jsons = [f.path for f in os.scandir(day_folder)]
                for log_json in log_jsons:
                    log_json_dict[format].append(log_json)

for format, log_jsons in log_json_dict.items():
    format_dir = f"../pokemon-showdown-client/play.pokemonshowdown.com/replays/{format}"
    if not os.path.exists(format_dir):
        os.makedirs(format_dir)
    for log_json in log_jsons:
        if not log_json.endswith(".json"):
            continue
        with open(log_json) as file:
            log = json.load(file)
        if log["turns"] < 2:
            continue
        id = log["roomid"].split("-")[2]
        p1 = re.sub(r'\W+', '', log['p1'])
        p2 = re.sub(r'\W+', '', log['p2'])
        p1 = p1.replace("_", "")
        p2 = p2.replace("_", "")
        name = f"{id}_{p1}_vs_{p2}.html"
        path = f"{format_dir}/{name}"
        logPath = f"{path}.log"
        # Skip if the replay already exists
        if (os.path.exists(path) and os.path.exists(logPath)):
            continue

        replay_object = Replay.create_replay_object(log, show_full_damage=True)
        html = Download.create_replay(replay_object,
                                      replay_embed_location=replay_embed_location)
        with open(path, "w") as f:
            f.write(html)

        with open(logPath, "w") as f:
            for line in log["log"]:
                f.write(line + "\n")

print("Generated Replays")
