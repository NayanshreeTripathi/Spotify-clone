console.log('lets write javascript')

let currentSong = new Audio();
let songs;
let currFolder;

function secondsTominutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;

}
async function getSongs(folder) {

    currFolder = folder;

    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
       
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                               <div>  ${song.replaceAll("%20", " ").split("-")[0]} </div>
                               <div>${song.replaceAll("%20", " ").split("-")[1].replace(".mp3" , " ")}</div>
                           </div>

                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div></li>`;

    }
    //attach a event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName('li')).forEach(e => {
        e.addEventListener("click", element => {
           // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playTrack(e.querySelector(".info").children[0].innerHTML.trim(),e.querySelector(".info").children[1].innerHTML.trim())
        })
    })
    return songs;

}
const playPrevOrNextMusic = (track) => {
    currentSong.src = `/songs/${currFolder}/${track}`;
    console.log(`/songs/${currFolder}/${track}`)
    currentSong.play();
    play.src = "img/pause.svg";
    
    document.querySelector(".songtime").innerHTML = `${secondsTominutesSeconds(currentSong.currentTime)}/${secondsTominutesSeconds(currentSong.duration)}`;
    document.querySelector(".songinfo").innerHTML = track.replaceAll("%20", " ").split(".mp3")[0];
}
const playTrack = (track, artist, pause = false) => {

    currentSong.src = `/${currFolder}/` + track + " - " + artist + ".mp3";
    console.log(currentSong.src)
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track + "-" + artist + ".mp3")
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}


const playMusic = (track, pause = false) => {

    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            console.log(e)
            let foldero = e.href.split("/songs/")[1]
            let folder = foldero.replace("/","")
            console.log(folder)
            //get the metadeta of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            //defining the structure of a card
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card ">
           <div class="play">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                   color="#000000" fill="#000">
                   <path
                       d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                       stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
               </svg>
           </div>
           <img src="/songs/${folder}/cover.jpg" alt="">
           <h2>${response.title}</h2>
           <p>${response.description}</p>
       </div> `
        }
    }
    //load the playlist wherever card is clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            console.log(songs)
        })
    })

}

async function main() {

    //get the list of all songs 
    await getSongs("songs/lofi")
    playMusic(songs[0], true)

    //display all the alubums on the page
    displayAlbums()



    //attach a event lister to paly previous next
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".songtime").innerHTML = `${secondsTominutesSeconds(currentSong.currentTime)}/${secondsTominutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        document.querySelector(".seekbar").style.background = `linear-gradient(to right, #1674e2 ${document.querySelector(".circle").style.left},black 0% )`
    })

    //add eventlistener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100

    })

    //add eventlistener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //add eventlistener to close button 
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    //add eventlistener to previous and next 
    previous.addEventListener("click", () => {
        console.log(songs)
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    //add eventlistener to previous and next 
    next.addEventListener("click", () => {
        console.log("next click")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    //event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to ", e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100
    })
    //event listener to volume track
    document.querySelector(".volume>img").addEventListener("click",e=>{
        console.log(e)
        if(e.target.src.includes( "img/volume.svg")){
            e.target.src =  e.target.src.replace("img/volume.svg","img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src =  e.target.src.replace("img/mute.svg","img/volume.svg")
            currentSong.volume = 0.5;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50;
        }
    })

}

main()