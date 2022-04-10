//Varuables
var can_edit, restart;
var next_lifeup = 500;
var currentlyPressedKey;
var is_active;
var player_life = 3;
var player_can_walk = true;
var pos_player_x = 0;
var pos_player_y = 0;
var width, height;
var time;
var bricks;
var pkt_coin;

//première appel
document.addEventListener('DOMContentLoaded', eventsContainer, false);
function eventsContainer() {
    // incrementation du score
    startGameLoop()
    time = document.getElementById('time')

    document.getElementById('life').innerHTML = player_life
    document.getElementById("overall_score").innerHTML = '000000'
    map_load(document.getElementById("level").value)
    document.getElementById("load").style.display = 'none'
    document.getElementById("start").addEventListener("click", startgame);
    document.getElementById("suicide").addEventListener("click", gameover);
    document.getElementById("bricks").addEventListener("mouseover", map_edit);
    document.getElementById("bricks").addEventListener("mouseup", function () {
        can_edit = false
    });
    document.getElementById("bricks").addEventListener("mousedown", function (event) {
        can_edit = true
        map_edit(event)
    })
    document.getElementById("levels").addEventListener("click", function (event) {
        if (document.getElementById("admin_tools").checked == false) {
            alert('STAY DETERMINED!') // Oui, je connais la référence à Undertale.
            event.preventDefault()
        }
    })
    document.getElementById("levels").addEventListener("change", function () {
        if (document.getElementById('levels').value) {
            _map_level_ = document.getElementById('levels').value
            map_load(document.getElementById("level").value)
        }
    })
    document.getElementById("save").addEventListener("click", function () {
        document.getElementById("level").value = map_save()
    })
    document.getElementById("load").addEventListener("click", function () {
        document.getElementById("overall_score").innerHTML = '000000'
        map_load(document.getElementById("level").value)
    })
    document.getElementById("pauza").addEventListener("click", function () {
        restart = true

        bricks.style.opacity = 0.5;
    })
    document.getElementById("coin_score").addEventListener("click", function () {
        document.getElementById("admin_tools").checked = true
        admin_tool()
    })
    admin_tool()
    document.getElementById("admin_tools").addEventListener("change", admin_tool)
}


Object.defineProperty(window, '_map_level_', {
    get: function () { // charge la valeur de la variable _map_level_ directement à partir du HTML
        return Number(document.getElementById('levels').value)
    },
    set: function (value) { // sauvegarde le nouveau niveau en HTML
        document.getElementById('levels').value = value
    }
})

function startGameLoop() {
    setInterval(move, 115);
}
// fonction  pour créer des cartes
function startgame() {
    makeLevel();
    //map_load()
    document.getElementById("coin_score").innerHTML = 0
    document.getElementById("overall_score").innerHTML = '000000'
    document.getElementById('time').innerHTML = Infinity
}

//Creation du niveau
function makeLevel() {
    restart = true
    width = document.getElementById('width_board').value
    height = document.getElementById('height_board').value
    document.getElementById("coin_score").innerHTML = 0
    bricks = document.getElementById('bricks')
    bricks.style.width = 20 * height + 'px'
    bricks.style.height = 20 * width + 'px'
    bricks.innerHTML = ''
    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {

            var bri = document.createElement("bri");
            bricks.appendChild(bri)

            bri.style.opacity = 0
            bri.style.top = i * 20 + "px"
            bri.style.left = j * 20 + "px"
            bri.id = i + "_" + j
            bri.className = 'T'
        }

    }
    var random = Array.from(document.getElementsByTagName("bri"))
    shuffle(random)

    function shuffle(array) {
        var currentIndex = array.length,
            temporaryValue, randomIndex;

        // Bien qu'il reste des éléments à remanier...
        while (0 !== currentIndex) {

            // Choisissez un élément restant...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // Et l'échanger avec l'élément actuel.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    //Gestion d'afffichage du score du diament
    var scoreDisplay = random.length - 1
    var interval_scoreboard = setInterval(function () {
        if (scoreDisplay >= 0) {
            random[scoreDisplay].style.opacity = '1'
            random[scoreDisplay - 1].style.opacity = '1'
            scoreDisplay -= 2
            player_can_walk = false
            document.getElementById("scoreboard2").style.display = 'flex'
            document.getElementById("scoreboard").style.display = 'none'
        } else {
            //var poz = document.querySelector('.player').id.split('_')

    
            player_can_walk = true
            document.getElementById("scoreboard2").style.display = 'none'
            document.getElementById("scoreboard").style.display = 'flex'
            clearInterval(interval_scoreboard)
            restart = false

        }
    }, 6)



    bri = document.getElementById(pos_player_x + '_' + pos_player_y);
    bri.className = 'P'
}
//functions
function zeroes(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
function random(x) {
    return x[Math.floor(x.length * Math.random())]
}

// Gestion des objets

function collision(bri) {
    switch (bri.className) {
        //Gestion de la terre
        case "T": {
            var dirt_sfx = new Audio("audio/dirt.ogg"); // tampons automatiquement lors de leur création
            dirt_sfx.play();
            dirt_sfx.volume = 0.04
            return true;
        }
         
        //Gestion du vide 

        case "V": {
            var clear_sfx = new Audio("audio/clear.ogg"); // tampons automatiquement lors de leur création
            clear_sfx.play();
            clear_sfx.volume = 0.04
            return true;
        }

        //Gestion des rochers
           
        case "R": {
            var pos_stone = bri.id.split('_')
            var to_right = document.getElementById(pos_stone[0] + '_' + (Number(pos_stone[1]) + 1))
            var to_left = document.getElementById(pos_stone[0] + '_' + (Number(pos_stone[1]) - 1))
            var player_bottom = document.getElementById((Number(pos_stone[0]) + 1) + '_' + pos_stone[1]) || {className: ''}
            var player_top = document.getElementById((Number(pos_stone[0]) - 1) + '_' + pos_stone[1]) || {className: ''}

            if (player_bottom.className == 'P' || player_top.className == 'P') {
                return false;
            }

            if (to_right.className == 'V') {
                to_right.className = 'R'
                return true;
            }

            if (to_left.className == 'V') {
                to_left.className = 'R'
                return true;
            }
            return false;
        }

        //Gestion des diaments
           
        case "D": {
            var snd = new Audio("audio/coin.ogg"); // tampons automatiquement lors de leur création
            snd.play();
            snd.volume = 0.04
            document.getElementById("coin_score").innerHTML++
            document.getElementById("overall_score").innerHTML = zeroes(Number(document.getElementById("overall_score").innerHTML) + Number(pkt_coin.innerHTML), 6)
            var coin_score = document.getElementById('coin_score')
            lifeup()
            //fonction ajoutant des zéros au résultat
            

            if (document.getElementById("coin_score").innerHTML == Number(document.getElementById('required_coins').innerHTML)) {
                document.documentElement.style.backgroundColor = 'white'
                setTimeout(function () {
                    document.documentElement.style.backgroundColor = 'black'
                }, 250)

                var coin_sfx = new Audio("audio/teleport1.ogg"); // tampons automatiquement lors de leur création
                coin_sfx.play();
                coin_sfx.volume = 0.04

                switch (_map_level_) {
                    case 1:
                        if (coin_score.innerHTML == '12') {
                            pkt_coin.innerHTML = '15'
                           
                        }
                        document.getElementById('16_38').className = 'teleport'
                        break
                    case 2:
                        if (coin_score.innerHTML == '10') {
                            pkt_coin.innerHTML = '15'

                        }
                        document.getElementById('20_18').className = 'teleport'
                        break
                    case 3:
                        if (coin_score.innerHTML == '24') {
                            pkt_coin.innerHTML = '00'
                        }
                        document.getElementById('18_39').className = 'teleport'
                        break
                    case 4:
                        if (coin_score.innerHTML == '36') {
                            pkt_coin.innerHTML = '20'
                        }
                        document.getElementById('20_38').className = 'teleport'
                        break
                    case 5: //bonus lvl1
                        if (coin_score.innerHTML == '6') {
                            pkt_coin.innerHTML = '00'
                        }
                        document.getElementById('10_18').className = 'teleport'
                        break
                    case 6:
                        if (coin_score.innerHTML == '4') {
                            pkt_coin.innerHTML = '90'
                        }
                        document.getElementById('20_39').className = 'teleport'

                        break
                    case 7:
                        if (coin_score.innerHTML == '4') {
                            pkt_coin.innerHTML = '60'
                        }
                        document.getElementById('18_38').className = 'teleport'

                        break
                    case 8:
                        if (coin_score.innerHTML == '15') {
                            pkt_coin.innerHTML = '20'
                        }
                        document.getElementById('5_39').className = 'teleport'

                        break
                    case 9:
                        if (coin_score.innerHTML == '10') {
                            pkt_coin.innerHTML = '20'
                        }
                        document.getElementById('3_0').className = 'teleport'
                        break
                    case 10: //bonus lvl 2                    
                        if (coin_score.innerHTML == '16') {
                            pkt_coin.innerHTML = '00'
                        }
                        document.getElementById('3_0').className = 'teleport'
                        break
                    case 11:
                        if (coin_score.innerHTML == '75') {
                            pkt_coin.innerHTML = '10'
                        }
                        break
                    case 12:
                        if (coin_score.innerHTML == '12') {
                            pkt_coin.innerHTML = '60'
                        }
                        document.getElementById('20_39').className = 'teleport'
                        break
                    case 13:
                        if (coin_score.innerHTML == '6') {
                            pkt_coin.innerHTML = '00'
                        }
                        document.getElementById('15_38').className = 'teleport'
                        break
                    case 14:
                        if (coin_score.innerHTML == '19') {
                            pkt_coin.innerHTML = '00'
                        }
                        document.getElementById('20_39').className = 'teleport'
                        break
                    case 15: //bonus lvl 3                                             
                        if (coin_score.innerHTML == '14') {
                            pkt_coin.innerHTML = '15'
                        }
                        document.getElementById('20_39').className = 'teleport'
                        break
                    case 16:
                        if (coin_score.innerHTML == '50') {
                            pkt_coin.innerHTML = '8'
                        }
                        document.getElementById('1_10').className = 'teleport'
                        break
                    case 17:
                        if (coin_score.innerHTML == '30') {

                            pkt_coin.innerHTML = '10'
                        }
                        document.getElementById('18_38').className = 'teleport'
                        break
                    case 18:
                        if (coin_score.innerHTML == '15') {
                            pkt_coin.innerHTML = '20'
                        }
                        document.getElementById('20_39').className = 'teleport'
                        break
                    case 19:
                        if (coin_score.innerHTML == '12') {
                            pkt_coin.innerHTML = '20'
                        }
                        document.getElementById('2_39').className = 'teleport'
                        break
                    case 20: //bonus lvl 4
                        if (coin_score.innerHTML == '6') {
                            pkt_coin.innerHTML = '00'
                        }
                        document.getElementById('2_39').className = 'teleport'
                        break
                }
            }
            return true;
        }

           
        case "enemy": {
            break;
        }
        case "obsidian": {
            return false
        }
        case "cobble": {
            return false
        }
        case "teleport": {
            restart = true
            var teleport_sfx = new Audio("audio/teleport.ogg"); // tampons automatiquement lors de leur création
            teleport_sfx.play();
            teleport_sfx.volume = 0.04
            var score = document.getElementById('overall_score')
            var interval = setInterval(function () {
                if (time.innerHTML > 0) {
                    player_can_walk = false // TU NE PASSERAS PAS ICI NON PLUS
                    score.innerHTML = zeroes(Number(score.innerHTML) + 1, 6)
                    time.innerHTML--
                        lifeup()
                    //score.innerHTML++
                } else {
                    clearInterval(interval)
                    map_load(document.getElementById("level").value)
                    //alert("poziom " + _map_level_ + "!")

                }
            }, 28)
            _map_level_++

            return true;
        }
           
        case "explosion": {
            return true;
        }
            
    }
}
var Set;
var pressedKey = new Set;

function registerKey(event) {
    currentlyPressedKey = event.which;
    pressedKey.add(event.which)
}

function releaseKey(event) {
    pressedKey.delete(event.which)
    if (pressedKey.size == 0) {
        currentlyPressedKey = null;
    }
}

/*Gestion des mouvement des objets
- new_x gère le mouvement des objets sur l'abscisse (vers la gauche et droite)
- new_y gère le mouvement des objets sur l'ordonnée (vers le haut et le bas)*/
function move() {
    var new_x, new_y;
    var can_walk = false;
    var player_texture;
    var key = currentlyPressedKey
    //console.log(currentlyPressedKey)
    if (player_can_walk == false) {
        return
    }
    /*touches de deplacement
    90 - z-> haut , 83 -s->bas, 81 -q->gauche, 68 - d->droit 
    - pos_player_x gère le mouvement du personnage vers les abscisses (gauche et droite)
    - pos_player_x gère le mouvement du personnage vers les ordeonnées (haut et bas)*/
    switch (key) {
        case 90:
            document.querySelector('.P').style.backgroundImage = ''
            new_x = pos_player_x - 1;
            new_y = pos_player_y - 0;
            bricks.style.opacity = 1;
            can_walk = true;
            restart = false
            break;
        case 83:
            document.querySelector('.P').style.backgroundImage = ''
            new_x = pos_player_x + 1;
            new_y = pos_player_y - 0;
            bricks.style.opacity = 1;
            can_walk = true;
            restart = false
            break;
        case 81:
            document.querySelector('.P').style.backgroundImage = ''
            player_texture = 'url(textures/player_left.gif)'
            new_x = pos_player_x - 0;
            new_y = pos_player_y - 1;
            bricks.style.opacity = 1;
            can_walk = true;
            restart = false
            break;
        case 68:
            document.querySelector('.P').style.backgroundImage = ''
            player_texture = 'url(textures/player_right.gif)'
            new_x = pos_player_x - 0;
            new_y = pos_player_y + 1;
            bricks.style.opacity = 1;
            can_walk = true;
            restart = false
            break;
        case 38: //strzałki
            document.querySelector('.P').style.backgroundImage = ''
            new_x = pos_player_x - 1;
            new_y = pos_player_y - 0;
            bricks.style.opacity = 1;
            can_walk = false;
            break;
        case 40:
            document.querySelector('.P').style.backgroundImage = ''
            new_x = pos_player_x + 1;
            new_y = pos_player_y - 0;
            bricks.style.opacity = 1;
            can_walk = false;
            break;
        case 37:
            document.querySelector('.P').style.backgroundImage = 'url(textures/player_left.gif)'
            new_x = pos_player_x - 0;
            new_y = pos_player_y - 1;
            bricks.style.opacity = 1;
            can_walk = false;
            break;
        case 39:
            document.querySelector('.P').style.backgroundImage = 'url(textures/player_right.gif)'
            new_x = pos_player_x - 0;
            new_y = pos_player_y + 1;
            bricks.style.opacity = 1;
            can_walk = false;
            break;
        case 27:
            restart = true
            break

        default:
            return;
    }

    var _bri = document.getElementById(new_x + '_' + new_y)
    if (_bri != null && collision(_bri)) {
        if (can_walk) {
            _bri.className = 'P'
            _bri.style.backgroundImage = player_texture || ''
            var star_poz = document.getElementById(pos_player_x + '_' + pos_player_y)

            star_poz.className = 'V';

            pos_player_y = new_y;
            pos_player_x = new_x;
        } else {
            _bri.className = 'V'
        }
    }

}

//Gestion de la map
function map_edit(event) {
    if (event.target !== event.currentTarget && can_edit && document.getElementById("admin_tools").checked) { 
        var game_objects = document.getElementById('game_objects').value
        event.target.className = game_objects;
    }
}

setInterval(falling, 150)

//Gestion de la chute des objets (Rocher et Diaments)
function falling() {
    if (restart) {
        return
    }
    var stone_coin = document.querySelectorAll(".R, .D, .cobble")
    var magic_cobble = document.querySelectorAll(".magic_cobble")
    var time;

    for (var j = magic_cobble.length - 1; j >= 0; j--) {

        var mag_cobble = magic_cobble[j]
        var pos_mag_cobble = mag_cobble.id.split('_')

        var mag_top = document.getElementById(Number(pos_mag_cobble[0]) - 1 + '_' + pos_mag_cobble[1]) || {}
        var mag_bottom = document.getElementById(Number(pos_mag_cobble[0]) + 1 + '_' + pos_mag_cobble[1]) || {}
       

        if (mag_top.className == 'R' && (mag_top.fall || is_active) && mag_bottom.className == 'V') {
            if (_map_level_ == 9) {
                time = 20000
            }
            if (_map_level_ == 18 || _map_level_ == 20) {
                time = 10000
            }
            if (_map_level_ == 19) {
                time = 25000
            }
            if (_map_level_ == 20) {
                time = 25000
            }
            active_mag_el(mag_cobble)
            setTimeout(deactive_mag_el, time, mag_cobble)
            if (is_active) {
                mag_top.className = 'V'
                mag_bottom.className = 'D'
            }

        } else if (mag_top.className == 'D' && is_active && mag_bottom.className == 'V') {
            if (_map_level_ == 9) {
                time = 20000
            }
            if (_map_level_ == 18 || _map_level_ == 20) {
                time = 10000
            }
            if (_map_level_ == 19) {
                time = 25000
            }
            if (_map_level_ == 20) {
                time = 25000
            }
            active_mag_el(mag_cobble)
            setTimeout(deactive_mag_el, time, mag_cobble)
            if (is_active) {
                mag_top.className = 'V'
                mag_bottom.className = 'R'
            }

        }
    }
    for (var i = stone_coin.length - 1; i >= 0; i--) {
        
        if (player_can_walk == false) {
            return
        }
        var stone = stone_coin[i]
        var pos = stone.id.split('_'); 
        var bottom = document.getElementById(Number(pos[0]) + 1 + '_' + pos[1]) || { className: ''}
        if (stone.className != 'R' && stone.className != 'D') {
            continue
        }
        var x = [1, -1]
        
        var rand_x = random(x)
        //choix d'un identifiant pour les chutes de pierre fallacego avec pierre
        var stone_near = document.getElementById(pos[0] + '_' + ((Number(pos[1]) + rand_x)))
        var stone_near_top = document.getElementById((Number(pos[0]) - 1) + '_' + ((Number(pos[1]) + rand_x)))
        var stone_near_bottom = document.getElementById((Number(pos[0]) + 1) + '_' + ((Number(pos[1]) + rand_x)))
        // vérification de la pierre_coinm
        var stone_top = document.getElementById((Number(pos[0]) - 1) + '_' + pos[1]) || {
            className: ''
        }
        //chute de la pierre lorsqu'elle est en l'air
        if (bottom.className == 'V') {
            if (stone.className == 'D') {
                var _rand_sound_ = Math.floor((Math.random() * 2) + 1);
                switch (_rand_sound_) {
                    case 1:
                        var snd = new Audio("audio/coin_fall1.ogg"); // tampons automatiquement lors de leur création
                        snd.play();
                        snd.volume = 0.04
                        break
                    case 2:
                        var snd = new Audio("audio/coin_fall2.ogg"); // tampons automatiquement lors de leur création
                        snd.play();
                        snd.volume = 0.04
                        break
                }

            }
            bottom.className = stone.className;
            bottom.fall = true
            stone.className = 'V'

            continue
        }
        //la chute de pierre en pierre
        if (stone_near != null && stone_near.className == 'V' && (stone_top.className == 'R' || stone_top.className == 'D') && stone_near_top.className == 'V') {
            stone_near_top.className = stone_top.className;
            stone_top.className = 'V'
        } else if (bottom.className == 'cobble' && stone_near_bottom.className == 'V' && stone_near.className == "V") {
            stone_near.className = stone.className
            stone.fall = true
            stone.className = 'V'
        }
        //Gestion de la mort du joueur lors de la chute de la pierre, et non lorsqu'il se trouve en bas de celle-ci

        if (bottom.className != 'V' && stone.fall == true && stone.className != 'D') {
            var stone_sfx = new Audio("audio/stone.ogg"); 

            stone_sfx.play();
            stone_sfx.volume = 0.03
        }

        if (stone.fall) {
            if (bottom.className == 'P') {

                coin_explosion(bottom.id.split('_'), 'V')
                gameover()
                stone.fall = false
            } else if (bottom.className == 'butterfly') {

                coin_explosion(bottom.id.split('_'), 'D')
            } else if (bottom.className == 'F') {
                coin_explosion(bottom.id.split('_'), 'V')
            }
        }

        if (bottom.className != 'V') {
            stone.fall = false
        }
    };
}

//Gestion du mouvement du papillon 
function Position(y, x) {
    this[0] = Number(y)
    this[1] = Number(x)
}
Position.prototype = {
    add: function (other) {
        return new Position(this[0] + Number(other[0] || 0), this[1] + Number(other[1] || 0))
    },
    get: function () {
        return document.getElementById(this[0] + '_' + this[1])
    }
}
setInterval(enemy, 150)

function enemy() {
    if (restart) {
        return
    }
    var allenemy = document.querySelectorAll('.F, .butterfly')
    for (var i = allenemy.length - 1; i >= 0; i--) {
        enemy_wall(allenemy[i])
    }
}

function move_one(enemy, direction) {
    var enemy_pos = enemy.id.split('_')
    var new_position = (new Position(enemy_pos[0], enemy_pos[1])).add(direction).get()
    if (new_position.className == 'V') {
        new_position.className = enemy.className
        enemy.className = 'V'
        return new_position
    } else if (new_position.className == 'P') {
        coin_explosion(new_position.id.split('_'), 'V')
        gameover()
    } else if (new_position.className == 'bio_mass') {
        if (enemy.className == 'F') {
            coin_explosion(enemy_pos, 'V')
        } else if (enemy.className == 'butterfly') {
            coin_explosion(enemy_pos, 'D')
        }
    }
}

function enemy_wall(enemy) {
    var attached_direction, blocked_direction;
    if (enemy.className == 'F') {
        attached_direction = +1
        blocked_direction = +3
    } else if (enemy.className == 'butterfly') {
        attached_direction = +3
        blocked_direction = +1
    } else {
        throw "cant't move"
    }
    var attached_to = ((enemy.direction || 0) + attached_direction) % 4
    var new_square;

    if (new_square = move_one(enemy, dir_to_pos[attached_to])) {
        new_square.direction = attached_to
    } else if (new_square = move_one(enemy, dir_to_pos[enemy.direction || 0])) {
        new_square.direction = enemy.direction
    } else {
        enemy.direction = ((enemy.direction || 0) + blocked_direction) % 4
    }
}

var dir_to_pos = [
    new Position(0, 1),
    new Position(-1, 0),
    new Position(0, -1),
    new Position(1, 0)
]

//Gestion de la fin du jeu avec tout les conditions possibles (la pierre tombe sur le joueur, le temps ecoulé...)

function gameover() {

    if (_map_level_ % 5 == 0) {
        _map_level_++
    } else {
        document.getElementById('life').innerHTML = player_life - 1
        player_life--
       

        if (player_life == 0) {
          
            window.location.href = "/index.html"


            document.getElementById('getttttttttttt_dunked_on').style.display = 'inline'
            document.getElementById('life').innerHTML = 3
            _map_level_ = 1
            player_life = 3
            next_lifeup = 500
            document.getElementById("overall_score").innerHTML = '000000'
        }
    }
    document.querySelector('.P').className = 'explosion'
    player_can_walk = false
    if (document.getElementById('time').innerHTML === '0')
        map_load(document.getElementById("level").value)
    else {
        setTimeout(map_load, 3000, document.getElementById("level").value)
    }
}

//Gestion de l'explosion des pierres pour creer les diaments
function coin_explosion(pos_player, typ) {
    var wokol_player = [
        document.getElementById(Number(pos_player[0]) + '_' + pos_player[1]) || {},
        document.getElementById(Number(pos_player[0]) + 1 + '_' + pos_player[1]) || {},
        document.getElementById(Number(pos_player[0]) + -1 + '_' + pos_player[1]) || {},
        document.getElementById(Number(pos_player[0]) + 1 + '_' + (Number(pos_player[1]) + 1)) || {},
        document.getElementById(Number(pos_player[0]) + 1 + '_' + (Number(pos_player[1]) - 1)) || {},
        document.getElementById(Number(pos_player[0]) - 1 + '_' + (Number(pos_player[1]) + 1)) || {},
        document.getElementById(Number(pos_player[0]) - 1 + '_' + (Number(pos_player[1]) - 1)) || {},
        document.getElementById(pos_player[0] + '_' + (Number(pos_player[1]) + 1)) || {},
        document.getElementById(pos_player[0] + '_' + (Number(pos_player[1]) - 1)) || {}
    ]
    document.getElementById(pos_player[0] + '_' + pos_player[1]).style.backgroundImage = ''
    for (var i = 0; i < wokol_player.length; i++) {
        if (wokol_player[i].className == 'P') {
            //document.getElementById("coin_score").innerHTML++
        } else if (wokol_player[i].className != 'obsidian') {
            wokol_player[i].className = 'explosion'

        }


    }

    //Definition du delai d'attente
    setTimeout(function () {
        for (var i = 0; i < wokol_player.length; i++) {

            if (wokol_player[i].className == 'P') {
                if (typ == 'D')
                    document.getElementById("coin_score").innerHTML++
            } else if (wokol_player[i].className == 'obsidian') {
                //emm
            } else wokol_player[i].className = typ

        }
    }, 600)
}

// Enregistrememnt de la map
function map_save() {
    var map = []
    for (var i = 0; i < width; i++) {
        map[i] = []
        for (var j = 0; j < height; j++) {
            map[i][j] = document.getElementById(i + "_" + j).className
        }
    }
    return JSON.stringify(map)
}

//Gestion d'affichage des maps
function map_load(s) {
    var required_coins = document.getElementById('required_coins')

    pkt_coin = document.getElementById('pkt_coin')
    if (_map_level_ == 21) {
        _map_level_ = 1
    }
    switch (_map_level_) {
        case 1:
            pkt_coin.innerHTML = '10'
            required_coins.innerHTML = '12'
            break
        case 2:
            pkt_coin.innerHTML = '20'
            required_coins.innerHTML = '10'
            break
        case 3:
            pkt_coin.innerHTML = '15'
            required_coins.innerHTML = '24'
            break
        case 4:
            pkt_coin.innerHTML = '5'
            required_coins.innerHTML = '36'
            break
        case 5: // bonus 1
            pkt_coin.innerHTML = '30'
            required_coins.innerHTML = '6'
            break
        case 6:
            pkt_coin.innerHTML = '50'
            required_coins.innerHTML = '4'
            break
        case 7:
            pkt_coin.innerHTML = '40'
            required_coins.innerHTML = '4'
            break
        case 8:
            pkt_coin.innerHTML = '15'
            required_coins.innerHTML = '10'
            break
        case 9:
            pkt_coin.innerHTML = '10'
            required_coins.innerHTML = '10'
            break
        case 10: //bonus 2
            pkt_coin.innerHTML = '10'
            required_coins.innerHTML = '16'
            break
        case 11:
            pkt_coin.innerHTML = '5'
            required_coins.innerHTML = '75'
            break
        case 12:
            pkt_coin.innerHTML = '25'
            required_coins.innerHTML = '12'
            break
        case 13:
            pkt_coin.innerHTML = '6'
            required_coins.innerHTML = '50'
            break
        case 14:
            pkt_coin.innerHTML = '19'
            required_coins.innerHTML = '20'
            break
        case 15: // bonus 3
            pkt_coin.innerHTML = '10'
            required_coins.innerHTML = '14'
            break
        case 16:
            pkt_coin.innerHTML = '5'
            required_coins.innerHTML = '50'
            break
        case 17:
            pkt_coin.innerHTML = '10'
            required_coins.innerHTML = '30'
            break
        case 18:
            pkt_coin.innerHTML = '15'
            required_coins.innerHTML = '10'
            break
        case 19:
            pkt_coin.innerHTML = '12'
            required_coins.innerHTML = '10'
            break
        case 20: // bonus 4
            pkt_coin.innerHTML = '6'
            required_coins.innerHTML = '30'
            break
    }

    // Entrée du jeu
    var snd_start;
    snd_start = new Audio("audio/start.ogg"); 
    snd_start.play()
    snd_start.volume = 0.04

    var oReq = new XMLHttpRequest();
    oReq.onload = reqListener;
    var str_level = 'levels/level_' + _map_level_ + '.txt'
    oReq.open("get", str_level, true);
    oReq.send();

    function reqListener() {
        var map = JSON.parse(this.responseText);
        document.getElementById('height_board').value = map[0].length
        document.getElementById('width_board').value = map.length
        makeLevel()
        time.innerHTML = 150
        document.getElementById("time").innerHTML = 150
        for (var i = 0; i < width; i++) {
            for (var j = 0; j < height; j++) {
                document.getElementById(i + "_" + j).className = map[i][j]
            }
        }
        var player = document.querySelector('.P')
        player = player.id.split('_')

        pos_player_x = Number(player[0])
        pos_player_y = Number(player[1])
        bri = player
    }
}


// Gestion des outils d'administration
function admin_tool() {
    if (document.getElementById("admin_tools").checked == true) {
        document.getElementById("save").style.display = 'inline'
        document.getElementById("level").style.display = 'inline'
        document.getElementById("game_objects").style.display = 'inline'
        document.getElementById("height_board").style.display = 'inline'
        document.getElementById("width_board").style.display = 'inline'
        document.getElementById("start").style.display = 'inline'
    }
    if (document.getElementById("admin_tools").checked == false) {
        document.getElementById("level").style.display = 'none'
        document.getElementById("game_objects").style.display = 'none'
        document.getElementById("height_board").style.display = 'none'
        document.getElementById("width_board").style.display = 'none'
        document.getElementById("start").style.display = 'none'
        document.getElementById("save").style.display = 'none'
    }
}

//Gestion d'intervalle
setInterval(czas_gry, 1000)

function czas_gry() {
    if (restart) {
        return
    }
    time.innerHTML--
        if (time.innerHTML == 0) {
            gameover()
        }


}
setInterval(bio_mass, 5000)



function lifeup() {
    var score = Number(document.getElementById("overall_score").innerHTML)
    while (score >= next_lifeup) {
        document.getElementById('life').innerHTML = player_life + 1
        next_lifeup += 500
        player_life++
    }

}
