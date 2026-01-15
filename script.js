console.log("Lets write some javascript");
let currFolder
let songs;
function updateActiveSong(index) {
    const songItems = document.querySelectorAll(".songList ul li");

    songItems.forEach(item => item.classList.remove("active-song"));

    if (songItems[index]) {
        songItems[index].classList.add("active-song");
    }
}


function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);

    return `${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/songs/${currFolder}`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    // console.log(as);

    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split(`%5C${currFolder}%5C`)[1]);
        }
    }

    //show all the songs in the play list
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];

    for (const song of songs) {
        songUL.innerHTML += `<li><img class="invert" src="img/music.svg" alt="">
                <div class="songinfo">
                <div>${song.replaceAll(/[•]+/g, " ").replaceAll(/\s+/g, " ").replaceAll("%20", " ").trim()}</div>
                <div>Song Artist</div>
                </div>
                <div class="playnow">
                <span>Play Now</span>
                <img  src="img/play.svg" alt="">
                </div>
        </li > `;
    }

    //attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".songinfo").firstElementChild.innerHTML.trim());
            // console.log(e.querySelector(".songinfo").firstElementChild.innerHTML)
        })
    })

    const songItems = document.querySelectorAll(".songList ul li");

    songItems.forEach(li => {
        li.addEventListener("click", () => {
            songItems.forEach(item => item.classList.remove("active-song"));
            li.classList.add("active-song");
        });
    });

    return songs;
}


let currentAudio = new Audio();
const playMusic = (track, pause = false) => {
    currentAudio.src = `songs/${currFolder}/` + track;
    if (!pause) {
        currentAudio.play();
        play.src = "img/pause.svg";
        updateActiveSong(0);
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00.00 / 00.00"

    let index = songs.indexOf(track);
    updateActiveSong(index);
}

async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch("http://127.0.0.1:3000/songs/");
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    console.log(anchors);
    let array = Array.from(anchors)
    let folders = [];  // collect folders in order
    for (let i = 0; i < array.length; i++) {
        const e = array[i];
        if (e.href.includes("songs")) {
            let folder = e.href.split("%5C").slice(-2)[1].split("/").slice(-2)[0];
            folders.push(folder);  // collect folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(response);
            document.querySelector(".cardContainer").innerHTML += `
            <div data-folder="${folder}" class="card">
            <div class="play-circle">
                            <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path
                                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" />
                            </svg>
                        </div>
                <img src="songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`;
        }
    }
    return folders;  // return folders array
}

async function main() {
    // Load albums and get folders in order
    const folders = await displayAlbums();
    
    // Load and display songs from the first folder on page refresh
    if (folders.length > 0) {
        await getSongs(folders[0]);
        if (songs.length > 0) {
            playMusic(songs[0], true);
        }
    }

    //attack an event listener to play , next and prev
    play.addEventListener("click", () => {
        if (currentAudio.paused) {
            currentAudio.play();
            play.src = "img/pause.svg";
        } else {
            currentAudio.pause();
            play.src = "img/play.svg";
        }
    })

    // Space bar to play/pause
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault(); // prevent page scroll

            if (currentAudio.paused) {
                currentAudio.play();
                play.src = "img/pause.svg";
            } else {
                currentAudio.pause();
                play.src = "img/play.svg";
            }
        }
    });

    // Volume up/down with arrow keys
    document.addEventListener("keydown", (e) => {
        const volumeIcon = document.querySelector('.timevol .volume img');
        const volumeInput = document.querySelector('.timevol .range input[type="range"]');
        if (e.code === "ArrowUp") {
            e.preventDefault();
            if (currentAudio.muted) {
                currentAudio.muted = false;
            }
            currentAudio.volume = Math.min(1, currentAudio.volume + 0.1);
            volumeInput.value = currentAudio.volume * 100;
            if (currentAudio.volume > 0) {
                volumeIcon.src = "img/volume.svg";
            }
        } else if (e.code === "ArrowDown") {
            e.preventDefault();
            currentAudio.volume = Math.max(0, currentAudio.volume - 0.1);
            volumeInput.value = currentAudio.volume * 100;
            if (currentAudio.volume === 0) {
                volumeIcon.src = "img/mute.svg";
            }
        }
    });


    //Listen for time update event
    currentAudio.addEventListener("timeupdate", () => {
        // console.log(currentAudio.currentTime,currentAudio.duration)
        document.querySelector(".songtime").innerHTML = `${formatTime(currentAudio.currentTime)} / ${formatTime(currentAudio.duration)}`;
        document.querySelector(".circle").style.left = (currentAudio.currentTime / currentAudio.duration) * 100 + "%";
    })

    let seekbar = document.querySelector(".seekbar");
    seekbar.addEventListener("click", (e) => {
        const rect = seekbar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = (clickX / rect.width);

        currentAudio.currentTime = (percent * currentAudio.duration);
    });

    //Add event listener to humburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //Add an event listener to previous button
    document.querySelector("#previous").addEventListener("click", () => {
        currentAudio.pause();
        console.log("Previos clicked")
        let index = songs.indexOf(currentAudio.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        } else {
            playMusic(songs[songs.length - 1]);
        }
    })


    //Add an event listener to next button
    document.querySelector("#next").addEventListener("click", () => {
        currentAudio.pause();
        console.log("Next clicked")
        let index = songs.indexOf(currentAudio.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]);
        }
    })


    // Volume control: wire the range input to the audio element
    const volumeInput = document.querySelector('.timevol .range input[type="range"]');
    const volumeIcon = document.querySelector('.timevol .volume img');

    if (volumeInput) {
        // initialize slider to current audio volume (0-100)
        volumeInput.value = Math.round((currentAudio.volume || 1) * 100);

        // update audio volume when user moves the slider
        volumeInput.addEventListener('input', (e) => {
            const v = Number(e.target.value) / 100;
            currentAudio.volume = v;
            // update icon opacity to indicate mute visually (optional)
            if (volumeIcon) volumeIcon.src = v === 0 ? "img/mute.svg" : "img/volume.svg";
        });
    }

    // clicking the volume icon toggles mute on/off
    if (volumeIcon) {
        volumeIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentAudio.muted) {
                currentAudio.muted = false;
                if (volumeInput) volumeInput.value = Math.round(currentAudio.volume * 100);
                volumeIcon.src = "img/volume.svg";
            } else {
                currentAudio.muted = true;
                if (volumeInput) volumeInput.value = 0;
                volumeIcon.src = "img/mute.svg";
            }
        });
    }

    //Load the Playlist based on the card clicked - using event delegation
    document.querySelector(".cardContainer").addEventListener("click", async (e) => {
        console.log(e)
        const card = e.target.closest(".card");
        if (!card) return;
        
        const folder = card.dataset.folder;
        console.log(folder);

        //clear the previous song list
        document.querySelector(".songList ul").innerHTML = "";
        await getSongs(folder);
    });

}
main(); 