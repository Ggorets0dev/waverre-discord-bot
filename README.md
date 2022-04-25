# Waver.RE Discord Bot
Discord bot for extracting WAV audio tracks from YouTube videos and playing them in the server's voice channels.

<p align='center'>
       <img height=350 src="Waver.RE_Logo.png"/>
</p>

<p align='center'>
   <a href="https://discordapp.com/users/933282998118412328/">
       <img height=35 src="https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white"/>
    </a>
</p>



## Purpose
---
### **In general**

_The main purpose of developing the Waver.RE bot is to improve the quality of music played in voice channels. Standard mp3 audio recordings have a bitrate of no more than 320kbs, the same is true some for other popular formats. When using WAV containers, we get slightly better sound quality with a bitrate not lower than 1400kbs, sacrificing a small amount of disk space. Improving the quality of audio recordings is subjective, however, I wanted to create my own bot in this area, and make it unlike other developments in this field. **In any case, this is just my variation of the Discord music bot.**_


### **Assumed placement**

_Bot is recommended to be placed with one of the administrators of one thematic server (or several). Thus, he will be able to configure custom settings so that they are suitable for all participants of this server (white list of performers and filtering in the names of the tracks in the output)._



## Tech
---
### **Used modules**

Software for extracting audio from videos: [FFmpeg](https://ffmpeg.org/).

Module for working with the cloud: [yandex-disk](https://www.npmjs.com/package/yandex-disk).

Module for working with Discord API: [Discord.js](https://www.npmjs.com/package/discord.js), [Discordjs/voice](https://www.npmjs.com/package/@discordjs/voice).


* Module for audio encoding: [Tweetnacl](https://www.npmjs.com/package/tweetnacl) _(required in Discordjs/voice)_.

* Module for playing audio in VCH: [FFmpeg-static](https://www.npmjs.com/package/ffmpeg-static) _(required in Discordjs/voice)_.


### **Step-by-step work**

The two main features of Waver.RE are discussed below:

* **Creating WAV**: Waver.RE downloads video from YouTube in webm format, then extracts the audio track from it and packs it into a file with WAV extension. This audio track is uploaded to Yandex.Disk, after which the person who made the request can download it via a link sent by bot.

* **Playing audio on VCH**: Waver.RE downloads video from YouTube in webm format, then plays it in requested voice channel. Thus, if a user requests to play a YouTube video (by sending a link as an argument), it is not converted to WAV before playing it.



## Installation
---
> Note: **Requires [NodeJS](https://nodejs.org/en/)**

The following steps are required for Waver.RE to work correctly:
1) Clone the repository (download source code)
2) Download and install dependencies using npm with package.json
3) Create your own **.env** file in bot folder with the **DISCORD_TOKEN** and **YADISK_TOKEN** variables
4) Download and install [FFmpeg](https://ffmpeg.org/) in your system **(don't forget to add it to PATH)**



## Usage
---

### **Commands**

The following commands are available in Waver.RE:

* **makew** *[quality] [url]* - Creating a WAV file from a Youtube video (quality: normal / best)
* **libw** *[show / №]* - Output a WAV audio library (show specified) or upload to the cloud a file with a specified index (number specified)
* **playw** *[url / № / all / all_random / query]* - Playback of audio files: from WAV audio library (number specified), from Youtube (link specified), all WAVs in order (all specified), all WAVs in random order (all_random specified), by keywords (set of words specified, а suitable track from YouTube will be launched)
* **pausew** - Pause of playing
* **resumew** - Resume of playing
* **skipw** - Skip currently playing audio track
* **stopw** - Stop audio playing
* **loopw** - Track currently playing loops (can be disabled by entering the command again)
* **audinfw** - Сurrent playback information
*  **queuew** - List of tracks in queue
*  **deletew** *[last / num] [N]* - Deleting the last N audio tracks from the queue (specifying last and number) or deleting one specific track (specifying num and number)
*  **findw** *[query]* - Searching for audio in the WAV audio library and on Youtube.
*  **choosew** *[№]* - Adding to the queue a track with the specified number from the database of found audio recordings (available only after calling findw)


| Command        | Alias       |
|:--------------:|:-----------:|
| pausew         | paw         |
| resumew        | rew         |
| skipw          | skw         |
| stopw          | stw         |
| loopw          | low         |
| audinfw        | auw         |
| queuew         | quw         |
| deletew        | dew         |
| findw          | fiw         |
| choosew        | chw         |



## Configuration
---

### **Custom settings folder**

The following functions are available to the host of Waver.RE when using **settings folder** (Each keyword or character set is specified on a new line in special TXT file):
  
* **Automatic addition of audio files to the audio library:** If the user requests to convert YouTube video with one of the artists from whitelist in the title, this audio will be added to the WAV audio library before uploading to Yandex.Disk. **(towavlib_artists.txt)**
* **Filtering of names when outputting information and saving files:** The host can specify which character combinations should be removed from the resulting name for a nicer look. **(todel_title_parts.txt)**

*If you have a problem with the user settings files, delete the **settings folder** in the bot's home folder. When it starts up, it will create it again with the desired initial values, after that you can edit it again.*


### **Configuration file**

The following parameters directly related to users can be changed in the configuration file of Waver.RE by the host:

* Prefix of commands
* Maximum duration of YouTube video files available for WAV extraction
* Maximum duration of YouTube video files available for WEBM audio playback
* Maximum number of WAV files stored on the cloud at one time
* Maximum size of the folder with WEBM tracks that will be used later for playback

*Configuration file contains other fields that can be changed, but it is **not recommended** to touch them unless necessary.*