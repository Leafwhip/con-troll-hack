// ==UserScript==
// @name         ConTroll hack
// @namespace    http://tampermonkey.net/
// @version      2024-07-29
// @description  goofy
// @author       You
// @match        http://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

setTimeout(function() {

    window.onbeforeunload = () => true;
    let godmode = false;
    let noclip = false;
    let paused = false;
    let death = game.current_map.scripts.death.replace(/this/g, 'game');
    let gameStates = [];
    let currentFrame;
    let framestepAmount = 1;

    document.body.insertAdjacentHTML('afterbegin', '<div id="timer"style="position:absolute;bottom:0;left:0;z-index:1000;color:white;font-size:120px;">TIMER</div>')

    // live timer
    function UpdateLiveTimer() {
        requestAnimationFrame(UpdateLiveTimer);
        timer.innerHTML = Math.round(frameCount*1000/60)/1000;
    }
    requestAnimationFrame(UpdateLiveTimer);

    window.addEventListener('keydown', e => {
        if (e.key == 'g') {
            // godmode
            if (!godmode) {
                if (game) {
                    game.current_map.scripts.death = '';
                    game.current_map.scripts.drown = '';
                    godmode = true;
                }
            }
            else {
                if (game) {
                    game.current_map.scripts.death = death;
                    game.current_map.scripts.drown = death;
                    godmode = false;
                }
            }
        }
        if (e.key == 'r') {
            // restart
            eval(death);
            dead = false;
        }
        if (e.key == 's') {
            // speedhack
            fpsInterval = parseInt(prompt('Set fpsInterval')) || 100/6;
        }
        if (e.key == 'p') {
            // spawnpoint
            fly.player.x = parseInt(prompt('Set player respawn x coordinate')) || game.current_map.player.x;
            fly.player.y = parseInt(prompt('Set player respawn y coordinate')) || game.current_map.player.x;
        }
        if (e.key == 'n') {
            // noclip
            game.current_map.keys.forEach(a => {
                if (!noclip) {
                    if (a.solid) {
                        a.solid = false;
                        a.wasSolid = true;
                        a.previousFriction = a.friction;
                        delete a.friction;
                    }
                }
                else {
                    if (a.wasSolid == true) {
                        a.solid = true;
                        a.friction = a.previousFriction;
                    }
                }
            });
            noclip = !noclip;
        }
        if (e.key == 'j') {
            // jump
            game.player.vel.y -= game.current_map.movement_speed.jump;
        }
        if (e.key == 'f') {
            // toggle fly
            if (game.current_map.fly) {
                game.current_map.fly = false;
                game.current_map.movement_speed.jump *= 20;
            }
            else {
                game.current_map.fly = true;
                game.current_map.movement_speed.jump /= 20;
            }
        }
        if (e.key == 'k') {
            // pause
            Pause();
        }
        function Pause() {
            if (paused) {
                paused = false;
                noloop = 0;
                gameStates.splice(currentFrame + 1);
            }
            else {
                paused = true;
                noloop = 1;
            }
        }
        if (e.key == '[') {
            // framestep left
            if (!paused) Pause();
            if (currentFrame == 0) return;
            currentFrame = Math.max(currentFrame - framestepAmount, 0);
            LoadGameState(currentFrame);
        }
        if (e.key == ']') {
            // framestep right
            if (!paused) Pause();
            if (currentFrame == gameStates.length - 1) return;
            currentFrame = Math.min(currentFrame + framestepAmount, gameStates.length - 1);
            LoadGameState(currentFrame);
        }
        if (e.key == '\\') {
            // change framestep amount
            framestepAmount = parseInt(prompt('Enter framestep amount')) || 1;
        }
        function LoadGameState(idx) {
            let [newGame, newFrameCount, newThen, newRemaining] = gameStates[idx];
            newGame = JSON.parse(newGame);
            Object.keys(newGame).forEach(a => {
                if (a == 'current_map') return;
                game[a] = JSON.parse(JSON.stringify(newGame[a]));
            });
            game.key = {left: false, right: false, up: false}
            frameCount = newFrameCount;
            then = newThen;
            remaining = newRemaining;
            game.draw(ctx);
        }
        function LogGameState() {
            if (!paused) {
                if (gameStates.length > 2000) gameStates.shift();
                gameStates.push([JSON.stringify(game), frameCount, then, remaining]);
                currentFrame = gameStates.length - 1;
            }
            //requestAnimationFrame(LogGameState);
        }
        //requestAnimationFrame(LogGameState);
        Loop = async function(t) {
            if (
                lid = window.requestAnimationFrame(Loop),
                frames = (elapsed = (now = t) - then) / fpsInterval,
                then = now,
                !noloop && !dead && 0 < frames && ("function" == typeof frame && frame(), game.moved)
            )
            {
                LogGameState();
                for (
                        frames >= remaining && (
                                                   frameCount += factor = remaining,
                                                   frames -= remaining,
                                                   frameCount = Math.round(frameCount),
                                                   game.update(!0),
                                                   remaining = 1
                                               ),
                        factor = 1;
                        1 <= frames;
                    )
                    frameCount += 1,
                    --frames,
                    game.update(!0);
                    0 < (factor = frames) && (
                                                 frameCount += factor,
                                                 remaining -= factor,
                                                 game.update(!1)
                                             )
            }
            game.draw(ctx)
        };
    })
});