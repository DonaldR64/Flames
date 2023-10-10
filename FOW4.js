const FOW4 = (() => { 
    const version = '4.10.8';
    if (!state.FOW4) {state.FOW4 = {}};

    //Constants and Persistent Variables

    const pageInfo = {name: "",page: "",gridType: "",scale: 0,width: 0,height: 0};
    const rowLabels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","BB","CC","DD","EE","FF","GG","HH","II","JJ","KK","LL","MM","NN","OO","PP","QQ","RR","SS","TT","UU","VV","WW","XX","YY","ZZ","AAA","BBB","CCC","DDD","EEE","FFF","GGG","HHH","III","JJJ","KKK","LLL","MMM","NNN","OOO","PPP","QQQ","RRR","SSS","TTT","UUU","VVV","WWW","XXX","YYY","ZZZ"];

    let TerrainArray = {};
    let TeamArray = {}; //Individual Squads, Tanks etc
    let UnitArray = {}; //Units of Teams eg. Platoon
    let FormationArray = {}; //to track formations
    let SmokeArray = {};
    let FoxholeArray = {};

    let unitCreationInfo = {}; //used during unit creation 

    let hexMap = {}; 
    let edgeArray = [];
    const DIRECTIONS = ["Northeast","East","Southeast","Southwest","West","Northwest"];
    const Colours = {
        green: "#00ff00",
        lightblue: "#00ffff",
        purple: "#800080",
        brown: "#980000",
        red: "#ff0000",
        yellow: "#ffff00",
        orange: "#ff9900",
        darkblue: "#0000ff",
        lightpurple: "#ff00ff",
        black: "#000000",
    }

    const SM = {
        "gtg": "status_brown",
        "dash": "status_Fast::5868456",
        "fired": "status_Shell::5553215",
        "tactical": "status_Advantage-or-Up::2006462",
        "hold": "status_Shield::2006495",
        "assault": "status_grenade",
        "mounted": "status_Mounted-Transparent::2006522",
        "flare": "status_Flare::5867553",
    }

    const PM = ["status_Green-01::2006603","status_Green-02::2006607","status_Green-03::2006611"];

    const commandRadius = [6,8];
    let outputCard = {title: "",subtitle: "",nation: "",body: [],buttons: []};
    const Axis = ["Germany","Italy","Japan","Waffen-SS"];
    const Allies = ["Soviet","USA","UK","Canadian"];
    const lastStandCount = {"Infantry": 3,"Gun": 2,"Tank": 2,"Unarmoured Tank": 2,"Aircraft": 1,};

    const Ranks = {
                "Germany": ["Major ","Hauptmann ","Oberleutnant ","Feldwebel "],
                "Waffen-SS": ["SS-Sturmbannführer ","SS-Hauptsturmführer ","SS-Obersturmführer ","SS-Oberscharführer "],
                "Western": ["Major ","Captain ","Lieutenant ","Sergeant "],
                "Soviet": ["Podpolkovnik ","Majór ","Kapitán ","Leytnant ","Serzhant "],
    };

    const Platoonmarkers = ["A::5626909","B::5626910","C::5626911","D::5626912","E::5626913","F::5626914","G::5626915","H::5626916","I::5626917","J::5626918","K::5626919","L::5626920","M::5626921","N::5626922","O::5626923","P::5626924","Q::5626925","R::5626926","S::5626927","T::5626928","U::5626929","V::5626930","W::5626931","X::5626932","Y::5626933","Z::5626934","1::5626903","2::5626904","1::5626905","2::5626906","1::5626907","2::5626908"];



    //Types: Flat = 0, Short = 1, Tall = 2, Building = 3

    const TerrainInfo = {
        "#00ff00": {name: "Woods",height: 2,bp: false,type: 2,group: "Woods"},
        "#20124d": {name: "Ruins",height: 1,bp: true,type: 1,group: "Rough"},
        "#000000": {name: "Hill 1",height:1,bp: false,type: 0,group: "Hill"},
        "#434343": {name: "Hill 2",height:2,bp: false,type: 0,group: "Hill"},
        "#666666": {name: "Hill 3",height:3,bp: false,type: 0,group: "Hill"},
        "#c0c0c0": {name: "Hill 4",height:4,bp: false,type: 0,group: "Hill"},
        "#00ffff": {name: "Marsh",height: 0,bp: false,type: 0,group: "Water"},
        "#b6d7a8": {name: "Scrub",height: 0,bp: false,type: 1,group: "Crops"},
        "#980000": {name: "Embankment",height: 0.25,bp: false,type: 0,group: "Hill"},
        "#ffffff": {name: "Ridgeline",height: .25,bp: true,type: 1,group: "Hill"},
    }

    const MapTokenInfo = {
        "wreck": {name: "Wreck",height: 0,bp: true,type: 1,group: "Obstacle"},
        "building 1": {name: "Building 1",height: 1,bp: true,type: 3,group: "Building"},
        "building 2": {name: "Building 2",height: 2,bp: true,type: 3,group: "Building"},
        "building 3": {name: "Building 3",height: 3,bp: true,type: 3,group: "Building"},
        "rubble": {name: "Rubble",height: 0,bp: true,type: 1,group: "Rough"},
        "anti-tank ditch": {name: "Anti-Tank Ditch",height: 0,bp: true,type: 0,group: "Trench"},
        "wall": {name: "Wall",height: 0,bp: true,type: 1,group: "Obstacle"},
        "hedge": {name: "Hedge",height: 0,bp: false,type: 1,group: "Obstacle"},
        "bocage": {name: "Bocage",height: 0,bp: true,type: 1,group: "Obstacle"},
        "dragon's teeth": {name: "Dragon's Teeth",height: 0,bp: true,type: 1,group: "Obstacle"},
        "road block": {name: "Road Block",height: 0,bp: true,type: 1,group: "Obstacle"},
        "crater": {name: "Craters",height: 0,bp: true,type: 0,group: "Rough"},        
        "crops": {name: "Crops",height: 0,bp: false,type: 1,group: "Crops"},
        "foxhole": {name: "Foxhole",height: 0,bp: true,type: 0,group: "Foxhole"},
        "smoke": {name: "Smoke",height: 0,bp: false,type: 0,group: "Smoke"},
        "smokescreen": {name: "SmokeScreen",height: 10,bp:false,type: 0,group: "Smoke"},
    }

    const Nations = {
        "Soviet": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/324272729/H0Ea79FLkZIn-3riEhuOrA/thumb.png?1674441877",
            "dice": "Soviet",
            "backgroundColour": "#FF0000",
            "titlefont": "Anton",
            "fontColour": "#000000",
            "borderColour": "#FFFF00",
            "borderStyle": "5px groove",
        },
        "Germany": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/324330922/vm_sbQZSkc81fR4CtQp57g/thumb.png?1674494502",
            "dice": "Germany",
            "backgroundColour": "#555C5F",
            "titlefont": "Bokor",
            "fontColour": "#FFFFFF",
            "borderColour": "#000000",
            "borderStyle": "5px double",
        },
        "UK": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/330506939/YtTgDTM3q7p8m0fJ4-E13A/thumb.png?1677713592",
            "backgroundColour": "#0E2A7A",
            "dice": "UK",
            "titlefont": "Merriweather",
            "fontColour": "#FFFFFF",
            "borderColour": "#BC2D2F",
            "borderStyle": "5px groove",
        },
        "USA": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/327595663/Nwyhbv22KB4_xvwYEbL3PQ/thumb.png?1676165491",
            "backgroundColour": "#FFFFFF",
            "dice": "USA",
            "titlefont": "Arial",
            "fontColour": "#006400",
            "borderColour": "#006400",
            "borderStyle": "5px double",
        },
        "Waffen-SS": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/324283125/RG-Yo1FkEWvzDprUsFl3Cg/thumb.png?1674447941",
            "backgroundColour": "#000000",
            "dice": "SS",
            "titlefont": "Bokor",
            "fontColour": "#FFFFFF",
            "borderColour": "#FF0000",
            "borderStyle": "5px ridge",
        },

        "Neutral": {
            "image": "",
            "backgroundColour": "#FFFFFF",
            "dice": "UK",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#00FF00",
            "borderStyle": "5px ridge",
        },

    }

    //Hex Info
    const xSpacing = 75.1985619844599;
    const ySpacing = 66.9658278242677;

    const HexInfo = {
        size: {
            x: xSpacing/Math.sqrt(3),
            y: ySpacing * 2/3,
        },
        pixelStart: {
            x: xSpacing/2,
            y: 43.8658278242683,
        },
        halfX: xSpacing/2,
        width: xSpacing,
        height: 89.2877704323569,
        directions: {},
    };

    const M = {
            f0: Math.sqrt(3),
            f1: Math.sqrt(3)/2,
            f2: 0,
            f3: 3/2,
            b0: Math.sqrt(3)/3,
            b1: -1/3,
            b2: 0,
            b3: 2/3,
    };

    class Point {
        constructor(x,y) {
            this.x = x;
            this.y = y;
        }
    };

    class Hex {
        constructor(q,r,s) {
            this.q = q;
            this.r =r;
            this.s = s;
        }

        add(b) {
            return new Hex(this.q + b.q, this.r + b.r, this.s + b.s);
        }
        subtract(b) {
            return new Hex(this.q - b.q, this.r - b.r, this.s - b.s);
        }
        static direction(direction) {
            return HexInfo.directions[direction];
        }
        neighbour(direction) {
            //returns a hex (with q,r,s) for neighbour, specify direction eg. hex.neighbour("NE")
            return this.add(HexInfo.directions[direction]);
        }
        neighbours() {
            //all 6 neighbours
            let results = [];
            for (let i=0;i<DIRECTIONS.length;i++) {
                results.push(this.neighbour(DIRECTIONS[i]));
            }
            return results;
        }

        len() {
            return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
        }
        distance(b) {
            return this.subtract(b).len();
        }
        round() {
            var qi = Math.round(this.q);
            var ri = Math.round(this.r);
            var si = Math.round(this.s);
            var q_diff = Math.abs(qi - this.q);
            var r_diff = Math.abs(ri - this.r);
            var s_diff = Math.abs(si - this.s);
            if (q_diff > r_diff && q_diff > s_diff) {
                qi = -ri - si;
            }
            else if (r_diff > s_diff) {
                ri = -qi - si;
            }
            else {
                si = -qi - ri;
            }
            return new Hex(qi, ri, si);
        }
        lerp(b, t) {
            return new Hex(this.q * (1.0 - t) + b.q * t, this.r * (1.0 - t) + b.r * t, this.s * (1.0 - t) + b.s * t);
        }
        linedraw(b) {
            //returns array of hexes between this hex and hex 'b'
            var N = this.distance(b);
            var a_nudge = new Hex(this.q + 1e-06, this.r + 1e-06, this.s - 2e-06);
            var b_nudge = new Hex(b.q + 1e-06, b.r + 1e-06, b.s - 2e-06);
            var results = [];
            var step = 1.0 / Math.max(N, 1);
            for (var i = 0; i <= N; i++) {
                results.push(a_nudge.lerp(b_nudge, step * i).round());
            }
            return results;
        }
        label() {
            //translate hex qrs to Roll20 map label
            let doubled = DoubledCoord.fromCube(this);
            let label = rowLabels[doubled.row] + (doubled.col + 1).toString();
            return label;
        }

        radius(rad) {
            //returns array of hexes in radius rad
            //Not only is x + y + z = 0, but the absolute values of x, y and z are equal to twice the radius of the ring
            let results = [];
            let h;
            for (let i = 0;i <= rad; i++) {
                for (let j=-i;j<=i;j++) {
                    for (let k=-i;k<=i;k++) {
                        for (let l=-i;l<=i;l++) {
                            if((Math.abs(j) + Math.abs(k) + Math.abs(l) === i*2) && (j + k + l === 0)) {
                                h = new Hex(j,k,l);
                                results.push(this.add(h));
                            }
                        }
                    }
                }
            }
            return results;
        }
        angle(b) {
            //angle between 2 hexes
            let origin = hexToPoint(this);
            let destination = hexToPoint(b);

            let x = Math.round(origin.x - destination.x);
            let y = Math.round(origin.y - destination.y);
            let phi = Math.atan2(y,x);
            phi = phi * (180/Math.PI);
            phi = Math.round(phi);
            phi -= 90;
            phi = Angle(phi);
            return phi;
        }        
    };

    class DoubledCoord {
        constructor(col, row) {
            this.col = col;
            this.row = row;
        }
        static fromCube(h) {
            var col = 2 * h.q + h.r;
            var row = h.r;
            return new DoubledCoord(col, row);//note will need to use rowLabels for the row, and add one to column to translate from 0
        }
        toCube() {
            var q = (this.col - this.row) / 2; //as r = row
            var r = this.row;
            var s = -q - r;
            return new Hex(q, r, s);
        }
    };

    const pointToHex = (point) => {
        let x = (point.x - HexInfo.pixelStart.x)/HexInfo.size.x;
        let y = (point.y - HexInfo.pixelStart.y)/HexInfo.size.y;
        let q = M.b0 * x + M.b1 * y;
        let r = M.b2 * x + M.b3 * y;
        let s = -q-r;
        let hex = new Hex(q,r,s);
        hex = hex.round();
        return hex;
    }

    const hexToPoint = (hex) => {
        let q = hex.q;
        let r = hex.r;
        let x = (M.f0 * q + M.f1 * r) * HexInfo.size.x;
        x += HexInfo.pixelStart.x;
        let y = (M.f2 * r + M.f3 * r) * HexInfo.size.y;
        y += HexInfo.pixelStart.y;
        let point = new Point(x,y);
        return point;
    }

    //core classes
    class Formation {
        constructor(player,nation,id,name){
            if (!id) {
                id = stringGen();
            }
            this.id = id;
            this.name = name;
            this.player = player;
            this.nation = nation;
            this.unitIDs = [];

            FormationArray[id] = this;
        }

        add(unit) {
            if (this.unitIDs.includes(unit.id) === false) {
                this.unitIDs.push(unit.id);
                unit.formationID = this.id;
            }
        }

        remove(unit) {
            let index = this.teamIDs.indexOf(team.id);
            if (index > -1) {
                this.teamIDs.splice(index,1);
            }
            if (this.teamIDs.length === 0) {
                //Bad Thing
            }
        }
    }

    class Unit {
        constructor(player,nation,id,name,formationID){
            if (!id) {
                id = stringGen();
            }
            this.id = id;
            this.name = name;
            this.player= player;
            this.nation = nation;
            this.formationID = formationID;
            this.teamIDs = [];
            this.order= "";
            this.hqUnit = false;
            this.aircraft = false;
            this.number = 0;

            UnitArray[id] = this;
        }

        add(team) {
            if (this.teamIDs.includes(team.id) === false) {
                if (team.token.get("status_black-flag") === true) {
                    this.teamIDs.unshift(team.id);
                } else {
                    this.teamIDs.push(team.id);
                }
                team.unitID = this.id;
                if (team.special.includes("HQ")) {
                    this.hqUnit = true;
                }
                if (team.type === "Aircraft") {
                    this.aircraft = true;
                }
            }
        }

        remove(team) {
            let index = this.teamIDs.indexOf(team.id);
            if (index === 0) {

            }
            if (index > -1) {
                this.teamIDs.splice(index,1);
    //check if leader
    //if leader dead, set new leader
    //check if in command radius, if is then eligible
    //defaults to 1st token if none in command radius


            }
            if (this.teamIDs.length === 0) {
                //Bad Thing
            }
        }


    }

    class Team {
        constructor(tokenID,formationID,unitID) {
            let token = findObjs({_type:"graphic", id: tokenID})[0];
            let char = getObj("character", token.get("represents")); 
            let charName = char.get("name");
            let attributeArray = AttributeArray(char.id);
            let nation = attributeArray.nation;
            let player = (Allies.includes(nation)) ? 0:1;
            if (nation === "Neutral") {player = 2};

            let type = attributeArray.type;
            let location = new Point(token.get("left"),token.get("top"));
            let hex = pointToHex(location);
            let hexLabel = hex.label();

            //weapons

            //special
            let special = attributeArray.special;
            if (!special || special === "") {
                special = " ";
            }

            let unique = attributeArray.unique;
            if (unique === 0) {unique = false};

            //armour
            let front = parseInt(attributeArray.armourF);
            let side = attributeArray.armourSR;
            if (side) {side = parseInt(side)} else {side = 0};
            let top = attributeArray.armourT;
            if (top) {top = parseInt(top)} else {top = 0};

            //passengers
            let maxPass = 0;
            if (type === "Tank") {
                maxPass = 3;
            }
/*
            if (special.includes("Transport")) {
                if (!state.FOW4.transports[tokenID]) {
                    state.FOW4.transports[tokenID] = [];
                }
                let px = Number(special.indexOf("Passengers")) + 11;
                maxPass = parseInt(special.substring(px,(px+1)));
            }
*/




            this.id = tokenID;
            this.token = token;
            this.name = token.get("name");
            this.player = player;
            this.nation = nation;
            this.characterName = charName;
            this.characterID = char.id;
            this.unitID = unitID;
            this.formationID = formationID;
            this.type = type;    
            this.location = location;
            this.prev = location;

            this.tactical = Number(attributeArray.tactical);
            this.terraindash = Number(attributeArray.terrain);
            this.countrydash = Number(attributeArray.country);
            this.roaddash = Number(attributeArray.road);
            this.cross = crossStat(attributeArray.cross);

            this.armourF = front;
            this.armourSR = side;
            this.armourT = top;

            this.motivation = parseStat(attributeArray.motivation);
            this.komissar = parseStat(attributeArray.komissar);
            this.laststand = parse2ndStat(attributeArray.laststand,this.motivation);
            this.rally = parse2ndStat(attributeArray.rally,this.motivation);
            this.counterattack = parse2ndStat(attributeArray.counterattack,this.motivation);
            this.remount = parse2ndStat(attributeArray.remount,this.motivation);
            this.skill = parseStat(attributeArray.skill);
            this.assault = parse2ndStat(attributeArray.assault,this.skill);
            this.tactics = parse2ndStat(attributeArray.tactics,this.skill);
            this.hit = parseStat(attributeArray.hit);
            //this.artilleryFlag = artFlag;
            //this.artillery = artillery;
            this.spotAttempts = 0;
            this.rangedInHex = {};


            this.hex = hex; //axial
            this.hexLabel = hexLabel; //doubled
            this.rotation = token.get("rotation");
            this.special = special;
            this.unique = unique;
            this.transport = "";
            this.passengers = [];
            //this.weaponArray = weaponArray;
            this.hitArray = [];
            this.maxPass = maxPass;

            TeamArray[tokenID] = this;
            hexMap[hexLabel].tokenIDs.push(tokenID);

        }


















    }












    //Various Routines
    const stringGen = () => {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 6; i++) {
            text += possible.charAt(Math.floor(randomInteger(possible.length)));
        }
        return text;
    }

    const findCommonElements = (arr1,arr2) => {
        //iterates through array 1 and sees if array 2 has any of its elements
        //returns true if the arrays share an element
        return arr1.some(item => arr2.includes(item));
    }

    const returnCommonElements = (array1,array2) => {
        return array1.filter(value => array2.includes(value));
    }

    const simpleObj = (o) => {
        p = JSON.parse(JSON.stringify(o));
        return p;
    }

    const getCleanImgSrc = (imgsrc) => {
        let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    }

    const DeepCopy = (variable) => {
        variable = JSON.parse(JSON.stringify(variable))
        return variable;
    }

    const Attribute = (character,attributename) => {
        //Retrieve Values from Character Sheet Attributes
        let attributeobj = findObjs({type:'attribute',characterid: character.id, name: attributename})[0]
        let attributevalue = "";
        if (attributeobj) {
            attributevalue = attributeobj.get('current');
        }
        return attributevalue;
    }

    const AttributeArray = (characterID) => {
        let aa = {}
        let attributes = findObjs({_type:'attribute',_characterid: characterID});
        for (let j=0;j<attributes.length;j++) {
            let name = attributes[j].get("name")
            let current = attributes[j].get("current")   
            if (!current || current === "") {current = " "} 
            aa[name] = current;

        }
        return aa;
    }

    const AttributeSet = (characterID,attributename,newvalue,max) => {
        if (!max) {max = false};
        let attributeobj = findObjs({type:'attribute',characterid: characterID, name: attributename})[0]
        if (attributeobj) {
            if (max === true) {
                attributeobj.set("max",newvalue)
            } else {
                attributeobj.set("current",newvalue)
            }
        } else {
            if (max === true) {
                createObj("attribute", {
                    name: attributename,
                    current: newvalue,
                    max: newvalue,
                    characterid: characterID,
                });            
            } else {
                createObj("attribute", {
                    name: attributename,
                    current: newvalue,
                    characterid: characterID,
                });            
            }
        }
    }

    const ButtonInfo = (phrase,action) => {
        let info = {
            phrase: phrase,
            action: action,
        }
        outputCard.buttons.push(info);
    }

    const SetupCard = (title,subtitle,nation) => {
        outputCard.title = title;
        outputCard.subtitle = subtitle;
        outputCard.nation = nation;
        outputCard.body = [];
        outputCard.buttons = [];
        outputCard.inline = [];
    }

    const DisplayDice = (roll,tablename,size) => {
        roll = roll.toString();
        let table = findObjs({type:'rollabletable', name: tablename})[0];
        let obj = findObjs({type:'tableitem', _rollabletableid: table.id, name: roll })[0];
        let avatar = obj.get('avatar');
        let out = "<img width = "+ size + " height = " + size + " src=" + avatar + "></img>";
        return out;
    }

    const PlaySound = (name) => {
        let sound = findObjs({type: "jukeboxtrack", title: name})[0];
        if (sound) {
            sound.set({playing: true,softstop:false});
        }
    };

    const FX = (fxname,team1,team2) => {
        //team2 is target, team1 is shooter
        //if its an area effect, team1 isnt used
        if (fxname.includes("System")) {
            //system fx
            fxname = fxname.replace("System-","");
            if (fxname.includes("Blast")) {
                fxname = fxname.replace("Blast-","");
                spawnFx(team2.location.x,team2.location.y, fxname);
            } else {
                spawnFxBetweenPoints(team1.location, team2.location, fxname);
            }
        } else {
            let fxType =  findObjs({type: "custfx", name: fxname})[0];
            if (fxType) {
                spawnFxBetweenPoints(team1.location, team2.location, fxType.id);
            }
        }
    }


    const getAbsoluteControlPt = (controlArray, centre, w, h, rot, scaleX, scaleY) => {
        let len = controlArray.length;
        let point = new Point(controlArray[len-2], controlArray[len-1]);
        //translate relative x,y to actual x,y 
        point.x = scaleX*point.x + centre.x - (scaleX * w/2);
        point.y = scaleY*point.y + centre.y - (scaleY * h/2);
        point = RotatePoint(centre.x, centre.y, rot, point);
        return point;
    }

    const XHEX = (pts) => {
        //makes a small group of points for checking around centre
        let points = pts;
        points.push(new Point(pts[0].x - 20,pts[0].y - 20));
        points.push(new Point(pts[0].x + 20,pts[0].y - 20));
        points.push(new Point(pts[0].x + 20,pts[0].y + 20));
        points.push(new Point(pts[0].x - 20,pts[0].y + 20));
        return points;
    }

    const Angle = (theta) => {
        while (theta < 0) {
            theta += 360;
        }
        while (theta > 360) {
            theta -= 360;
        }
        return theta
    }   

    const RotatePoint = (cX,cY,angle, p) => {
        //cx, cy = coordinates of the centre of rotation
        //angle = clockwise rotation angle
        //p = point object
        let s = Math.sin(angle);
        let c = Math.cos(angle);
        // translate point back to origin:
        p.x -= cX;
        p.y -= cY;
        // rotate point
        let newX = p.x * c - p.y * s;
        let newY = p.x * s + p.y * c;
        // translate point back:
        p.x = Math.round(newX + cX);
        p.y = Math.round(newY + cY);
        return p;
    }

    const pointInPolygon = (point,polygon) => {
        //evaluate if point is in the polygon
        px = point.x
        py = point.y
        collision = false
        vertices = polygon.vertices
        len = vertices.length - 1
        for (let c=0;c<len;c++) {
            vc = vertices[c];
            vn = vertices[c+1]
            if (((vc.y >= py && vn.y < py) || (vc.y < py && vn.y >= py)) && (px < (vn.x-vc.x)*(py-vc.y)/(vn.y-vc.y)+vc.x)) {
                collision = !collision
            }
        }
        return collision
    }

    const TokenVertices = (tok) => {
        //Create corners with final being the first
        let corners = []
        let tokX = tok.get("left")
        let tokY = tok.get("top")
        let w = tok.get("width")
        let h = tok.get("height")
        let rot = tok.get("rotation") * (Math.PI/180)
        //define the four corners of the target token as new points
        //also rotate those corners around the target tok centre
        corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX-w/2, tokY-h/2 )))     //Upper left
        corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX+w/2, tokY-h/2 )))     //Upper right
        corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX+w/2, tokY+h/2 )))     //Lower right
        corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX-w/2, tokY+h/2 )))     //Lower left
        corners.push(RotatePoint(tokX, tokY, rot, new Point( tokX-w/2, tokY-h/2 )))     //Upper left
        return corners
      }

      const Name = (nat) => {
        let num = randomInteger(25) - 1;
        if (nat === "Canadian") {nat = "UK"};
        if (nat.includes("SS")) {nat = "Germany"};
        let names = {
            Germany: ["Schmidt","Schneider","Fischer","Weber","Meyer","Wagner","Becker","Schulz","Hoffmann","Bauer","Richter","Klein","Wolf","Schroder","Neumann","Schwarz","Braun","Hofmann","Werner","Krause","Konig","Lang","Vogel","Frank","Beck"],
            Soviet: ["Ivanov","Smirnov","Petrov","Sidorov","Popov","Vassiliev","Sokolov","Novikov","Volkov","Alekseev","Lebedev","Pavlov","Kozlov","Orlov","Makarov","Nikitin","Zaitsev","Golubev","Tarasov","Ilyin","Gusev","Titov","Kuzmin","Kiselyov","Belov"],
            USA: ["Smith","Johnson","Williams","Brown","Jones","Wright","Miller","Davis","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Thompson","White","Harris","Clark","Lewis","Robinson","Walker","Young","Allen"],
            UK: ["Smith","Jones","Williams","Taylor","Davies","Brown","Wilson","Evans","Thomas","Johnson","Roberts","Walker","Wright","Robinson","Thompson","White","Hughes","Edwards","Green","Lewis","Wood","Harris","Martin","Jackson","Clarke"],
        }

        let nameList = names[nat];
        let surname = nameList[num];
        return surname;
    }
      
    const RotateToken = (team1,team2,max) => {
        let angle = team1.hex.angle(team2.hex);
        let token = team1.token;
        if (max) {
            let curAngle = Angle(token.get("rotation"));
            let delta = angle - curAngle;
            if (Math.abs(delta) > max) {
                angle = curAngle + (Math.sign(delta) * max);
            }
        }
        token.set("rotation",angle);
        team1.rotation = angle;
    } 

    const teamHeight = (team) => {
        //height of token based on terrain, with additional based on type
        let hex = hexMap[team.hexLabel];
        let height = parseInt(hex.elevation);
        if (team.type === "Infantry" && hex.terrain.includes("Building")) {
            height = parseInt(hex.height) - 1;
        } 
        if (team.type === "Aircraft") {
            height += 20;
        }
        return height;
    }

    const ClearState = () => {
        //clear arrays
        UnitArray = {};
        TeamArray = {};
        FormationArray = {};

        SmokeArray = {};
        FoxholeArray = {};
        
        //clear token info
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        });
        tokens.forEach((token) => {
            token.set({
                name: "",
                tint_color: "transparent",
                aura1_color: "transparent",
                aura1_radius: 0,
                showname: true,
                showplayers_aura1: true,
                gmnotes: "",
                statusmarkers: "",
            });                
        })

        //RemoveDead("All");

        state.FOW4 = {
            nations: [[],[]],
            players: {},
            playerInfo: [[],[]],
            lineArray: [],
            labmode: false,
            transports: {},
            passengers: {},
            darkness: false,
            turn: 0,
            gametype: "",
            currentPlayer: "",
            timeOfDay: "",
            startingPlayer: "",
        }
        sendChat("","Cleared State/Arrays");
    }



    const PrintCard = (id) => {
        let output = "";
        if (id) {
            let playerObj = findObjs({type: 'player',id: id})[0];
            let who = playerObj.get("displayname");
            output += `/w "${who}"`;
        } else {
            output += "/desc ";
        }

        if (!outputCard.nation || !Nations[outputCard.nation]) {
            outputCard.nation = "Neutral";
        }

        //start of card
        output += `<div style="display: table; border: ` + Nations[outputCard.nation].borderStyle + " " + Nations[outputCard.nation].borderColour + `; `;
        output += `background-color: #EEEEEE; width: 100%; text-align: centre; `;
        output += `border-radius: 1px; border-collapse: separate; box-shadow: 5px 3px 3px 0px #aaa;;`;
        output += `"><div style="display: table-header-group; `;
        output += `background-color: ` + Nations[outputCard.nation].backgroundColour + `; `;
        output += `background-image: url(` + Nations[outputCard.nation].image + `), url(` + Nations[outputCard.nation].image + `); `;
        output += `background-position: left,right; background-repeat: no-repeat, no-repeat; background-size: contain, contain; align: centre,centre; `;
        output += `border-bottom: 2px solid #444444; "><div style="display: table-row;"><div style="display: table-cell; padding: 2px 2px; text-align: centre;"><span style="`;
        output += `font-family: ` + Nations[outputCard.nation].titlefont + `; `;
        output += `font-style: normal; `;

        let titlefontsize = "1.4em";
        if (outputCard.title.length > 12) {
            titlefontsize = "1em";
        }

        output += `font-size: ` + titlefontsize + `; `;
        output += `line-height: 1.2em; font-weight: strong; `;
        output += `color: ` + Nations[outputCard.nation].fontColour + `; `;
        output += `text-shadow: none; `;
        output += `">`+ outputCard.title + `</span><br /><span style="`;
        output += `font-family: Arial; font-variant: normal; font-size: 13px; font-style: normal; font-weight: bold; `;
        output += `color: ` +  Nations[outputCard.nation].fontColour + `; `;
        output += `">` + outputCard.subtitle + `</span></div></div></div>`;

        //body of card
        output += `<div style="display: table-row-group; ">`;

        let inline = 0;

        for (let i=0;i<outputCard.body.length;i++) {
            let out = "";
            let line = outputCard.body[i];
            if (!line || line === "") {continue};
            if (line.includes("[INLINE")) {
                let end = line.indexOf("]");
                let substring = line.substring(0,end+1);
                let num = substring.replace(/[^\d]/g,"");
                if (!num) {num = 1};
                line = line.replace(substring,"");
                out += `<div style="display: table-row; background: #FFFFFF;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color: #000000; `;
                out += `"> <div style='text-align: centre; display:block;'>`;
                out += line + " ";

                for (let q=0;q<num;q++) {
                    let info = outputCard.inline[inline];
                    out += `<a style ="background-color: ` + Nations[outputCard.nation].backgroundColour + `; padding: 5px;`
                    out += `color: ` + Nations[outputCard.nation].fontColour + `; text-align: centre; vertical-align: middle; border-radius: 5px;`;
                    out += `border-color: ` + Nations[outputCard.nation].borderColour + `; font-family: Tahoma; font-size: x-small; `;
                    out += `"href = "` + info.action + `">` + info.phrase + `</a>`;
                    inline++;                    
                }
                out += `</div></span></div></div>`;
            } else {
                line = line.replace(/\[hr(.*?)\]/gi, '<hr style="width:95%; align:centre; margin:0px 0px 5px 5px; border-top:2px solid $1;">');
                line = line.replace(/\[\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})\](.*?)\[\/[\#]\]/g, "<span style='color: #$1;'>$2</span>"); // [#xxx] or [#xxxx]...[/#] for color codes. xxx is a 3-digit hex code
                line = line.replace(/\[[Uu]\](.*?)\[\/[Uu]\]/g, "<u>$1</u>"); // [U]...[/u] for underline
                line = line.replace(/\[[Bb]\](.*?)\[\/[Bb]\]/g, "<b>$1</b>"); // [B]...[/B] for bolding
                line = line.replace(/\[[Ii]\](.*?)\[\/[Ii]\]/g, "<i>$1</i>"); // [I]...[/I] for italics
                let lineBack = (i % 2 === 0) ? "#D3D3D3" : "#EEEEEE";
                out += `<div style="display: table-row; background: ` + lineBack + `;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color: #000000; `;
                out += `"> <div style='text-align: centre; display:block;'>`;
                out += line + `</div></span></div></div>`;                
            }
            output += out;
        }

        //buttons
        if (outputCard.buttons.length > 0) {
            for (let i=0;i<outputCard.buttons.length;i++) {
                let out = "";
                let info = outputCard.buttons[i];
                out += `<div style="display: table-row; background: #FFFFFF;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color: #000000; `;
                out += `"> <div style='text-align: centre; display:block;'>`;
                out += `<a style ="background-color: ` + Nations[outputCard.nation].backgroundColour + `; padding: 5px;`
                out += `color: ` + Nations[outputCard.nation].fontColour + `; text-align: centre; vertical-align: middle; border-radius: 5px;`;
                out += `border-color: ` + Nations[outputCard.nation].borderColour + `; font-family: Tahoma; font-size: x-small; `;
                out += `"href = "` + info.action + `">` + info.phrase + `</a></div></span></div></div>`;
                output += out;
            }
        }

        output += `</div></div><br />`;
        sendChat("",output);
        outputCard = {title: "",subtitle: "",nation: "",body: [],buttons: [],};
    }

    const SetStatus = (ids,status,setting) => {
        for (let i=0;i<ids.length;i++) {
            let team = TeamArray[ids[i]];
            team.token.set(status,setting);
        }
    }

    const parseStat = (x) => {
        if (x) {
            p = x.replace(/[^\d]/g, "");
        }
        if (isNaN(p)) {
            p = 7;
        }
        return p;
    }

    const parse2ndStat = (x,y) => {
        let p = parseInt(y);
        if (x) {
            p = x.replace(/[^\d]/g, "");
        }
        if (isNaN(p)) {
            p = parseInt(y);
        }
        return p;
    }

    const crossStat = (x) => {
        let c = 1;
        if (x) {
            c = parseInt(x);
            if (isNaN(c)) {c = 1};
        }
        return c;
    }

    const Rank = (nat,j) => {
        if (nat === "UK" || nat === "Canadian" || nat === "USA") {nat = "Western"};        
        let rank = Ranks[nat][j];
        return rank
    }


    const LoadPage = () => {
        //build Page Info and flesh out Hex Info
        pageInfo.page = getObj('page', Campaign().get("playerpageid"));
        pageInfo.name = pageInfo.page.get("name");
        pageInfo.scale = pageInfo.page.get("snapping_increment");
        pageInfo.width = pageInfo.page.get("width") * 70;
        pageInfo.height = pageInfo.page.get("height") * 70;

        HexInfo.directions = {
            "Northeast": new Hex(1, -1, 0),
            "East": new Hex(1, 0, -1),
            "Southeast": new Hex(0, 1, -1),
            "Southwest": new Hex(-1, 1, 0),
            "West": new Hex(-1, 0, 1),
            "Northwest": new Hex(0, -1, 1),
        }

        let edges = findObjs({_pageid: Campaign().get("playerpageid"),_type: "path",layer: "map",stroke: "#d5a6bd",});
        let c = pageInfo.width/2;
        for (let i=0;i<edges.length;i++) {
            edgeArray.push(edges[i].get("left"));
        }
        if (edgeArray.length === 0) {
            sendChat("","Add Edge(s) to map and reload API");
            return;
        } else if (edgeArray.length === 1) {
            if (edgeArray[0] < c) {
                edgeArray.push(pageInfo.width)
            } else {
                edgeArray.unshift(0);
            }
        } else if (edgeArray.length === 2) {
            edgeArray.sort((a,b) => parseInt(a) - parseInt(b));
        } else if (edgeArray.length > 2) {
            sendChat("","Error with > 2 edges, Fix and Reload API");
            return
        }
    }


    const BuildMap = () => {
        let startTime = Date.now();
        hexMap = {};
        //builds a hex map, assumes Hex(V) page setting
        let halfToggleX = HexInfo.halfX;
        let rowLabelNum = 0;
        let columnLabel = 1;
        let startX = xSpacing/2;
        let startY = 43.8658278242683;

        for (let j = startY; j <= pageInfo.height;j+=ySpacing){
            let rowLabel = rowLabels[rowLabelNum];
            for (let i = startX;i<= pageInfo.width;i+=xSpacing) {
                let point = new Point(i,j);     
                let label = (rowLabel + columnLabel).toString(); //id of hex
                let hexInfo = {
                    id: label,
                    centre: point,
                    terrain: [], //array of names of terrain in hex
                    terrainIDs: [], //used to see if tokens in same building or such
                    tokenIDs: [], //ids of tokens in hex
                    elevation: 0, //based on hills
                    height: 0, //height of top of terrain over elevation
                    smoke: false,
                    smokescreen: false,
                    type: 0,
                    bp: false,
                };
                hexMap[label] = hexInfo;
                columnLabel += 2;
            }
            startX += halfToggleX;
            halfToggleX = -halfToggleX;
            rowLabelNum += 1;
            columnLabel = (columnLabel % 2 === 0) ? 1:2; //swaps odd and even
        }
    
        BuildTerrainArray();

        let taKeys = Object.keys(TerrainArray);
        for (let i=0;i<taKeys.length;i++) {
            let polygon = TerrainArray[taKeys[i]];
            if (polygon.linear === false) {continue};
            Linear(polygon);
        }

        let keys = Object.keys(hexMap);
        const burndown = () => {
            let key = keys.shift();
            if (key){
                let c = hexMap[key].centre;
                if (c.x >= edgeArray[1] || c.x <= edgeArray[0]) {
                    //Offboard
                    hexMap[key].terrain = ["Offboard"];
                } else {
                    let temp = DeepCopy(hexMap[key]);
                    for (let t=0;t<taKeys.length;t++) {
                        let polygon = TerrainArray[taKeys[t]];
                        if (temp.terrain.includes(polygon.name) || polygon.linear === true) {continue};
                        let check = false;
                        let pts = [];
                        pts.push(c);
                        pts = XHEX(pts);
                        let num = 0;
                        for (let i=0;i<5;i++) {
                            check = pointInPolygon(pts[i],polygon);
                            if (i === 0 && check === true) {
                                //centre pt is in hex, can skip rest
                                num = 3;
                                break;
                            }
                            if (check === true) {num ++};
                        }
                        if (num > 2) {
                            temp.terrain.push(polygon.name);
                            temp.terrainIDs.push(polygon.id);
                            if (polygon.name === "SmokeScreen") {
                                temp.smokescreen = true;
                                temp.smoke = true;
                                let sInfo = {
                                    hex: key,
                                    id: polygon.id, //id of the Smoke token, can be used to remove later
                                }
                                SmokeArray[key] = sInfo; 
                            }
                            if (polygon.name === "Smoke") {
                                temp.smoke = true;
                                let sInfo = {
                                    hex: key,
                                    id: polygon.id, //id of the Smoke token, can be used to remove later, its bar1 will have # activations left
                                }
                                SmokeArray[key] = sInfo;                            
                            }
                            if (polygon.name === "Foxhole") {
                                let fInfo = {
                                    hex: key,
                                    id: polygon.id, //id of the Foxhole token, can be used to remove later
                                }
                                FoxholeArray[key] = fInfo;
                            }

                            if (polygon.bp === true) {temp.bp = true};

                            if (polygon.name.includes("Hill")) {
                                temp.elevation = Math.max(temp.elevation,polygon.height);
                                temp.height = Math.max(temp.elevation,polygon.height)
                            } else {
                                temp.height = Math.max(temp.height,polygon.height);
                                temp.type = Math.max(temp.type,polygon.type);
                            };
                        };
                    };
                    if (temp.terrain.length === 0) {
                        temp.terrain.push("Open Ground");
                    }
                    hexMap[key] = temp;
                }
                setTimeout(burndown,0);
            }
        }
        burndown();

        let elapsed = Date.now()-startTime;
        log("Hex Map Built in " + elapsed/1000 + " seconds");
        //add tokens to hex map, rebuild Team/Unit Arrays
        TA();
    }

    const BuildTerrainArray = () => {
        TerrainArray = {};
        //first look for graphic lines outlining hills etc
        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "path",layer: "map"});
        paths.forEach((pathObj) => {
            let vertices = [];
            toFront(pathObj);
            let colour = pathObj.get("stroke").toLowerCase();
            let t = TerrainInfo[colour];
            if (!t) {return};  
            let path = JSON.parse(pathObj.get("path"));
            let centre = new Point(pathObj.get("left"), pathObj.get("top"));
            let w = pathObj.get("width");
            let h = pathObj.get("height");
            let rot = pathObj.get("rotation");
            let scaleX = pathObj.get("scaleX");
            let scaleY = pathObj.get("scaleY");

            //covert path vertices from relative coords to actual map coords
            path.forEach((vert) => {
                let tempPt = getAbsoluteControlPt(vert, centre, w, h, rot, scaleX, scaleY);
                if (isNaN(tempPt.x) || isNaN(tempPt.y)) {return}
                vertices.push(tempPt);            
            });
            let id = stringGen();
            if (TerrainArray[id]) {
                id += stringGen();
            }
            let linear = (t.name === "Ridgeline") ? true:false;

            let info = {
                name: t.name,
                id: id,
                vertices: vertices,
                centre: centre,
                height: t.height,
                bp: t.bp,
                type: t.type,
                group: t.group,
                obstacle: t.obstacle,
                linear: linear,
            };
            TerrainArray[id] = info;
        });
        //add tokens on map eg woods, crops
        let mta = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        mta.forEach((token) => {
            let truncName = token.get("name").toLowerCase();
            truncName = truncName.trim();
            let t = MapTokenInfo[truncName];
            if (!t) {return};

            let vertices = TokenVertices(token);
            let centre = new Point(token.get('left'),token.get('top'));
            let id = stringGen();
            if (TerrainArray[id]) {
                id += stringGen();
            }
            let info = {
                name: t.name,
                id: id,
                vertices: vertices,
                centre: centre,
                height: t.height,
                bp: t.bp,
                type: t.type,
                group: t.group,
                obstacle: t.obstacle,
                linear: false,
            };
            TerrainArray[id] = info;
        });
    };

    const Linear = (polygon) => {
        //adds linear obstacles, eg Ridgelines, to hex map
        let vertices = polygon.vertices;
        for (let i=0;i<(vertices.length - 1);i++) {
            let hexes = [];
            let pt1 = vertices[i];
            let pt2 = vertices[i+1];
            let hex1 = pointToHex(pt1);
            let hex2 = pointToHex(pt2);
            hexes = hex1.linedraw(hex2);
            for (let j=0;j<hexes.length;j++) {
                let hex = hexes[j];
                let hexLabel = hex.label();
                if (!hexMap[hexLabel]) {continue};
                if (hexMap[hexLabel].terrain.includes(polygon.name)) {continue};
                hexMap[hexLabel].terrain.push(polygon.name);
                hexMap[hexLabel].terrainIDs.push(polygon.id);
                hexMap[hexLabel].los = Math.max(hexMap[hexLabel].los,polygon.los);
                hexMap[hexLabel].cover = Math.max(hexMap[hexLabel].cover,polygon.cover);
                hexMap[hexLabel].move = Math.max(hexMap[hexLabel].move,polygon.move);
                hexMap[hexLabel].obstacle = Math.max(hexMap[hexLabel].obstacle,polygon.obstacle);
                hexMap[hexLabel].height = Math.max(hexMap[hexLabel].height,polygon.height);
                if (polygon.cover === 2) {
                    hexMap[hexLabel].coverID = polygon.id
                }
            }
        }
    }

    const TA = () => {
        //add tokens on map into various arrays
        UnitArray = {};
        TeamArray = {};
        FormationArray = {};
        //create an array of all tokens
        let start = Date.now();
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        });

        let c = tokens.length;
        let s = (1===c?'':'s');     
        tokens.forEach((token) => {
            let character = getObj("character", token.get("represents"));           
            if (character === null || character === undefined) {return};
            let nation = Attribute(character,"nation");
            let info = decodeURIComponent(token.get("gmnotes")).toString();
            if (!info) {return};
            info = info.split(";");
            let player = (Allies.includes(nation)) ? 0:1;
            let formationName = info[0];
            let formationID = info[1];
            let formation = FormationArray[formationID];
            let unitName = info[2];
            let unitID = info[3];
            let rank = parseInt(info[4]);
            let unit = UnitArray[unitID];
            let statusmarkers = token.get("statusmarkers").split(",")
            let unitMarker = returnCommonElements(statusmarkers,Platoonmarkers);
            let unitNumber = Platoonmarkers.indexOf(unitMarker);

            if (!formation) {
                formation = new Formation(player,nation,formationID,formationName);
            }
            if (!unit) {
                unit = new Unit(player,nation,unitID,unitName,formationID);
                unit.number = unitNumber;
                formation.add(unit);
            }
            let team = new Team(token.id,formationID,unitID);
            team.rank = rank;
            unit.add(team);
        });

        let elapsed = Date.now()-start;
        log(`${c} token${s} checked in ${elapsed/1000} seconds - ` + Object.keys(TeamArray).length + " placed in Team Array");
    }


    const Facing = (id1,id2) => { //id2 is the target, id1 is the shooter - returns the facing of id 2
        let facing = "Front";
        let team1 = TeamArray[id1];
        let vertices1 = TokenVertices(team1.token);
        let team2 = TeamArray[id2];
        let vertices2 = TokenVertices(team2.token);
        //top corners of target, to define its front line
        let A = vertices2[0];    //Upper left
        let B = vertices2[1];    //Upper right
        //  center of the target token
        let C2 = team2.location;
        let D = ((C2.x - A.x) * (B.y - A.y)) - ((C2.y - A.y) * (B.x - A.x)) //for the target - where front line is relative to centre
        D = Math.sign(D)
        //D will be (-) if on one side, (+) if on other of front line
        // for reference use vertices of shooter
        for (let i=0;i<4;i++) {
            let C1 = vertices[i]
            // https://math.stackexchange.com/questions/274712/calculate-on-which-side-of-a-straight-line-is-a-given-point-located
            let E = ((C1.x - A.x) * (B.y - A.y)) - ((C1.y - A.y) * (B.x - A.x)) //for the shooter - where vertice is relative to front line of target
            E = Math.sign(E)
            //E will be (-) or (+) based on which side of front line, and if E is same sign as D is on same side as centre ie. behind front line
            if (D===E || E === 0) {
                facing = "Side/Rear"
                break;
            } 
        }
        return facing
    }

    const UnitCreation = (msg) => {
        let Tag = msg.content.split(";");
        let unitName = Tag[1];
        let teamIDs = [];
        for (let i=0;i<msg.selected.length;i++) {
            teamIDs.push(msg.selected[i]._id);
        }
        if (teamIDs.length === 0) {return};
        let refToken = findObjs({_type:"graphic", id: teamIDs[0]})[0];
        let refChar = getObj("character", refToken.get("represents")); 
        let nation = Attribute(refChar,"nation");
        let player = (Allies.includes(nation)) ? 0:1;

        let support = FormationArray[player];
        if (!support) {
            support = new Formation(player,nation,(player+1),"Support");
        }

        let formationKeys = Object.keys(FormationArray);
        let newID = stringGen();
        SetupCard("Unit Creation","",nation);
        outputCard.body.push("Select Existing Formation or New");

        ButtonInfo("New","!UnitCreation2;" + newID + ";?{Formation Name}");
        for (let i=0;i<formationKeys.length;i++) {
            let formation = FormationArray[formationKeys[i]];
            if (formation.nation !== nation) {continue};
            let action = "!UnitCreation2;" + formation.id;
            ButtonInfo(formation.name,action);
        }

        PrintCard();

        unitCreationInfo = {
            nation: nation,
            player: player,
            newID: newID,
            teamIDs: teamIDs,
            unitName: unitName,
        }
    }

    const UnitCreation2 = (msg) => {
        let Tag = msg.content.split(";");
        let unitName = unitCreationInfo.unitName;
        let player = unitCreationInfo.player;
        let nation = unitCreationInfo.nation;
        let teamIDs = unitCreationInfo.teamIDs;
        let formationID = Tag[1];
        let formation = FormationArray[formationID];
        if (!formation) {
            formation = new Formation(player,nation,formationID,Tag[2]);
        }
        let unit = new Unit(player,nation,stringGen(),unitName,formationID);
        unit.number = formation.unitIDs.length;
        let unitMarker = Platoonmarkers[unit.number];
        formation.add(unit);
        let basegmn = formation.name + ";" + formation.id + ";" + unitName + ";" + unit.id + ";";
        for (let i=0;i<teamIDs.length;i++) {
            let team = new Team(teamIDs[i],formationID,unit.id);
            unit.add(team);
            let aura = "transparent";
            if (i === 0) {
                aura = Colours.green
            };
            let info = NameAndRank(team,i);
            team.name = info.name;
            team.rank = info.rank;
            gmn = basegmn + team.rank.toString();

            team.token.set({
                name: team.name,
                tint_color: "transparent",
                aura1_color: aura,
                aura1_radius: 0.25,
                showname: true,
                gmnotes: gmn,
                statusmarkers: unitMarker,
            })
        }
        if (state.FOW4.nations[player].includes(nation) === false) {
            state.FOW4.nations[player].push(nation);
        }



        sendChat("",unitName + " Added to " + formation.name)
    }

    const NameAndRank = (team,i) => {
        let name = team.characterName.replace(team.nation + " ","");
        let unit = UnitArray[team.unitID];
        if (team.type.includes("Tank")) {
            name = name.replace(team.nation + " ","");
            let item = ((unit.number+1) * 100) + i
            name += " " + item.toString();
        } else if (team.type === "Infantry" || team.type === "Gun") {
            name += " "+ i;
        } 
        let rank = Ranks[team.nation].length - 1;
        if (team.special.includes("HQ")) {
            rank = Math.min(i,1);
            unit.hqUnit = true;
            name = Rank(team.nation,rank) + Name(team.nation);
        } else {
            if (team.type === "Aircraft" || i === 1) {
                rank = 2;
                unit.aircraft = true;
                if (team.nation === "Soviet") {rank=3};
                name = Rank(team.nation,rank) + Name(team.nation);
            } else if (name.includes("Komissar")) {
                name = "Komissar " + Name(team.nation);
            } else if (i === 0) {
                rank = 2;
                name = Rank(team.nation,rank) + Name(team.nation);
            } 
        }
        let info = {
            name: name,
            rank: rank,
        }
        return info;
    }

    const TokenInfo = (msg) => {
        if (!msg.selected) {
            sendChat("","No Token Selected");
            return;
        };
        let id = msg.selected[0]._id;
        let team = TeamArray[id];
        if (!team) {
            sendChat("","Not in Team Array Yet");
            return;
        };
        let nation  = team.nation;
        if (!nation) {nation = "Neutral"};
        SetupCard(team.name,"Hex: " + team.hexLabel,nation);
        let h = hexMap[team.hexLabel];
        let terrain = h.terrain;
        terrain = terrain.toString();
        let elevation = teamHeight(team);
        let unit = UnitArray[team.unitID];
        outputCard.body.push("Terrain: " + terrain);
        let covers = ["the Open","Short Terrain","Tall Terrain","a Building"];
        outputCard.body.push(team.name + " is in " + covers[h.type]);
        if (h.bp === true) {
            outputCard.body.push("(Bulletproof Cover)");
        }
        outputCard.body.push("Elevation: " + (elevation * 25) + " Feet");
        outputCard.body.push("[hr]");
        outputCard.body.push("Unit: " + unit.name);
        for (let i=0;i<unit.teamIDs.length;i++) {
            let m = TeamArray[unit.teamIDs[i]];
            outputCard.body.push(m.name);
        }
        PrintCard();
    }

    const LOS = (id1,id2,special) => {
        if (!special || special === "") {special = " "}; //  overhead - ignores concealment/BP for Short and intervening units
        
        let team1 = TeamArray[id1];
        let team2 = TeamArray[id2];
        if (!team1) {
            log("No Team 1: " + id1)
        }
        if (!team2) {
            log("No Team 2: " + id2)
        }
    
        let distanceT1T2 = team1.hex.distance(team2.hex);
        let nightVisibility = distanceT1T2;
        let losReason = "";

        if (state.FOW4.darkness === true && special.includes("Spotter") === false && team2.token.get(SM.flare) === false) {
            nightVisibility = randomInteger(6) * 4;
            if (team1.special.includes("Infra-Red") || team1.special.includes("Thermal")) {
                nightVisibility = Math.max(nightVisibility,randomInteger(6)*4);
            }
        }
    
        let facing = Facing(id1,id2);
        let shooterFace = Facing(id2,id1);
        let team1Height = teamHeight(team1);
        let team2Height = teamHeight(team2);
        let teamLevel = Math.min(team1Height,team2Height);
        team1Height -= teamLevel;
        team2Height -= teamLevel;
    log("Team1 H: " + team1Height)
    log("Team2 H: " + team2Height)
    
        let interHexes = team1.hex.linedraw(team2.hex); //hexes from shooter (hex 0) to target (hex at end)
        let team1Hex = hexMap[team1.hexLabel];
        let team2Hex = hexMap[team2.hexLabel];
        let sameTerrain = findCommonElements(team1Hex.terrainIDs,team2Hex.terrainIDs);
        let lastElevation = team1Height;

        let hexesWithBuild = 0;
        let hexesWithTall = 0;
        let concealed = false;
        let bulletproof = false;
        let smoke = false;
        let los = true;
    
        if (nightVisibility < distanceT1T2) {
            let result = {
                los: false,
                concealed: false,
                bulletproof: false,
                smoke: false,
                facing: facing,
                shooterface: shooterFace,
                distance: distanceT1T2,
            }
            losReason = "Night Visibility < Distance"
            return result;    
        }
    
        let fKeys = Object.keys(TeamArray);

        if (team2Hex.bp === true || (team2Hex.terrain.includes("Foxholes") && team2.type === "Infantry")) {
            //this catches foxholes, craters and similar
            concealed = true;
            bulletproof = true;
        }
    
        if (team2Hex.terrain.includes("Ridgeline") && team1Hex.terrain.includes("Ridgeline") === false && team1Height < team2Height) {
            //on a ridgeline with shooter below, ie hulldown
            concealed = true;
            bulletproof = true;
        }
    
        if (team1.type === "Aircraft" || team2.type === "Aircraft") {
            if (team1.type === "Aircraft") {
                let st = Math.max(interHexes.length - 5,0); //4 hexes before target plus target hex
                for (let i=st;i<interHexes.length;i++) {
                    let qrs = interHexes[i];
                    let interHex = hexMap[qrs.label()];
                    if (interHex.type === "Tall" || interHex.type === "Building") {
                        concealed = true;
                    }
                    if (interHex.smoke === true || interHex.smokescreen) {smoke = true};
                }
            } else {
                let en = Math.min(interHexes.length,5); //4 hexes from shooter plus shooters hex
                for (let i=0;i<en;i++) {
                    let qrs = interHexes[i];
                    let interHex = hexMap[qrs.label()];
                    if (interHex.type === "Tall" || interHex.type === "Building") {
                        concealed = true;
                    }                
                    if (interHex.smoke === true) {smoke = true};
                }
            }
        } else {
            if (sameTerrain === true && team1Hex.type === "Building") {
                // team 1 and 2 are in same building/room
                concealed = true;
                bulletproof = true;
            } else {
                //not in same building
                for (let i=2;i<interHexes.length;i++) {
                    let qrs = interHexes[i];
                    let qrsLabel = qrs.label();
                    let interHex = hexMap[qrsLabel];
    log(i + ": " + qrsLabel)
    log(interHex.terrain)
    log("Type: " + interHex.type)
                    if (interHex.smoke === true) {smoke = true};
                    if (interHex.smokescreen === true) {
                        if (distanceT1T2 > 6) {
                            los = false;
                            break;
                        } else {
                            smoke = true;
                        }
                    }
                    let interHexElevation = parseInt(interHex.elevation) - teamLevel;
                    let interHexHeight = parseInt(interHex.height);
                    let B;
                    if (team1Height > team2Height) {
                        B = (distanceT1T2 - i) * team1Height / distanceT1T2;
                    } else if (team1Height <= team2Height) {
                        B = i * team2Height / distanceT1T2;
                    }
        log("InterHex Height: " + interHexHeight);
        log("InterHex Elevation: " + interHexElevation);
        log("Last Elevation: " + lastElevation);
        log("B: " + B)
                    if (interHexElevation < lastElevation && lastElevation > team1Height && lastElevation > team2Height) {
                        los = false;
                        losReason = "Terrain Drops off at " + qrsLabel;
                        break;
                    }            

                    let friendlyFlag = false;
                    let friendlyHeight = 0;
        
                    if (special !== "Overhead") {
            //check for intervening friendlies in 1 hexes of interHex - can ignore if same team
                        //if find one, flag and note height
            log("Friendlies")
                        for (let t=0;t<fKeys.length;t++) {
                            let fm = TeamArray[fKeys[t]];
                            if (fm.id === team1.id || fm.id === team2.id || fm.player !== team1.player || fm.unitID === team1.unitID) {continue};
                            if (fm.type === "Infantry" && fm.token.get(SM.moved) === false && fm.token.get(SM.dash) === false) {continue};
                            let dis = fm.hex.distance(qrs);
                            if (dis < 2) {
            log(fm.name)
                                friendlyFlag = true;
                                fmHeight = teamHeight(fm);
                                friendlyHeight = Math.max(fmHeight,friendlyHeight);
                                if (special === "Flamethrower") {friendlyHeight = 100}; //basically cant fire Flamethrower over heads of friendlies
                            }
                        }
                    }

                    lastElevation = interHexElevation;

                    if (interHexHeight + interHexElevation + friendlyHeight >= B) {
                        if (friendlyFlag === true) {
                            losReason = "Friendly at " + qrsLabel + " blocks LOS"
                            los = false;
                            break;
                        }
        log("Terrain higher than B")
                        if (interHex.type === 3) {
                            hexesWithBuild++;
                        }
                        if (hexesWithBuild > 2) {
                            los = false;
                            losReason = "> 2 hexes into Building at " + qrsLabel;
                            break;
                        }
                        if (hexesWithBuild > 1 && interHex.type < 3) {
                            los = false;
                            losReason = "Other side of Building at " + qrsLabel;
                            break;
                        }


                        if (interHex.type === 2) {
                            hexesWithTall++;
                        }
                        if (hexesWithTall > 2 && distanceT1T2 > 6) {
                            los = false;
                            losReason = "> 2 hexes through Tall terrain at " + qrsLabel; 
                            break;
                        }
                        if (interHex.type > 0) {
                            concealed = true;
                        }
                        if (interHex.bp === true) {
                            bulletproof = true;
                        }
                    } else {
        log("Terrain less than B")

                    }
                }
            }
            if (team2.type === "Infantry" && team2.token.get(SM.moved) === false && team2.token.get(SM.dash) === false) {
                concealed = true //infantry teams that didnt move are concealed to all but Aircraft
        log("Infantry didnt move = Concealed")
            }

        }
    
        if (special.includes("Defensive")) {bulletproof = false};
    
        let result = {
            los: los,
            losReason: losReason,
            concealed: concealed,
            bulletproof: bulletproof,
            smoke: smoke,
            facing: facing,
            shooterface: shooterFace,
            distance: distanceT1T2,
        }
        return result;
    }

    
    const TestLOS = (msg) => {
        let Tag = msg.content.split(";");
        let id1 = Tag[1];
        let id2 = Tag[2];
        if (!id1 || !id2) {return};
        let team1 = TeamArray[id1];
        let team2 = TeamArray[id2];
    
        SetupCard("LOS","",team1.nation);
        outputCard.body.push(team1.name + " looking at " + team2.name);
    
        let losResult = LOS(id1,id2,"");
    
        outputCard.body.push("[hr]");
        outputCard.body.push("Distance: " + losResult.distance);
        outputCard.body.push("LOS: " + losResult.los);

        if (losResult.los !== false) {
            outputCard.body.push("Concealed: " + losResult.concealed);
            if (team2.type === "Infantry") {
                outputCard.body.push("Bulletproof Cover: " + losResult.bulletproof);
            }
            outputCard.body.push("Smoke: " + losResult.smoke);
            if (team2.type === "Tank") {
                outputCard.body.push(team2.name + " Facing: " + losResult.facing);
            }
        } else {
            outputCard.body.push(losResult.losReason);
        }
    
        PrintCard();
    }

    const SetupGame = (msg) => {
        state.FOW4.turn = 0;
        let Tag = msg.content.split(";");
        let gametype = Tag[1];
        let startingPlayer = Number(Tag[2]);
        let timeOfDay = Tag[3];
        if (timeOfDay === "Random") {
            let roll = randomInteger(6);
            if (roll < 3) {timeOfDay = "Dawn"};
            if (roll === 3 || roll === 4) {timeOfDay = "Daylight"};
            if (roll > 4) {timeOfDay = "Dusk"};
        }
    
        state.FOW4.gametype = gametype;
        state.FOW4.currentPlayer = startingPlayer;
        state.FOW4.timeOfDay = timeOfDay;
        state.FOW4.darkness = false;
        if (timeOfDay === "Dawn" || timeOfDay === "Night") {
            state.FOW4.darkness = true;
        }
        state.FOW4.startingPlayer = startingPlayer;
        let nat = state.FOW4.nations[startingPlayer][0];

        //let side = ["Warsaw Pact","NATO"];
        //if (state.FOW4.nations[startingPlayer].length > 1) {
        //    nat = side[startingPlayer];
        //}

        SetupCard("Setup New Game","","Neutral");
        outputCard.body.push("Game Type: " + gametype);
        outputCard.body.push("First Player: " + nat);
        outputCard.body.push("Time of Day: " + timeOfDay);
        PrintCard();
    }
    
    const GM = () => {
        SetupCard("GM Functions","","Neutral");
        ButtonInfo("Add Abilities","!AddAbilities");
        ButtonInfo("Clear State","!ClearState");
        ButtonInfo("Change Phase","!ChangePhase;?{New Phase|Start|Movement|Shooting|Assault}");
        //ButtonInfo("Kill Selected Team","!!KillTeam;@{selected|token_id}");
        ButtonInfo("Setup New Game","!SetupGame;?{Game Type|Meeting Engagement|Attack/Defend};?{First Player|Allies,0|Axis,1};?{Time of Day|Daylight|Dawn|Dusk|Night|Random}");
        //ButtonInfo("Test LOS","!TestLOS;@{selected|token_id};@{target|token_id}");
        //ButtonInfo("Unit Creation","!UnitCreation;?{Unit Name};?{Formation Name};?{Support|No|Yes};");
        //ButtonInfo("Team Unit Info","!TeamInfo");
        PrintCard();
    }

    const ActivateUnit = (msg) => {
        //RemoveLines();
        let Tag = msg.content.split(";");
        let teamID = msg.selected[0]._id;
        let team = TeamArray[teamID];
        let order = Tag[1];
        let unit = UnitArray[team.unitID];
        let unitLeader = TeamArray[unit.teamIDs[0]];
        SetupCard(unit.name,order,unit.nation);
        let sms = [SM.tactical,SM.dash,SM.hold,SM.assault];
        for (let i=0;i<sms.length;i++) {
            unitLeader.token.set(sms[i],false);
        }

        if (order.includes("Tactical")) {
            outputCard.body.push("Teams can move at Tactical Speed, and may fire at their Moving ROF");
            outputCard.body.push('Teams cannot move within 2" of visible enemies');
            unitLeader.token.set(SM.tactical,true);
        } else if (order.includes("Dash")) {
            outputCard.body.push("Teams can move at Dash Speed, but may not fire");
            outputCard.body.push('Teams cannot move within 8" of visible enemies');
            unitLeader.token.set(SM.dash,true);
        } else if (order.includes("Hold")) {
            outputCard.body.push("Teams stay in place, and may fire at their Halted ROF");
            outputCard.body.push("Teams not firing are Gone to Ground");
            unitLeader.token.set(SM.hold,true);
        } else if (order.includes("Assault")) {
            outputCard.body.push('Teams can move at Tactical Speed to a Max of 10", and may fire at their Moving ROF');
            outputCard.body.push('Teams must target an enemy within 8" of the Team it will charge into');
            outputCard.body.push("Eligible Teams can complete the charge");
            unitLeader.token.set(SM.assault,true);
        } else if (order.includes("Aircraft")) {
            outputCard.body.push('Aircraft may move anywhere on Battlefield');
            unitLeader.token.set(SM.tactical,true);
        }

        PrintCard();
    }

    

    const AddAbilities = (msg) => {
        if (!msg) {return}
        let id = msg.selected[0]._id;
        if (!id) {return};
        let token = findObjs({_type:"graphic", id: id})[0];
        let char = getObj("character", token.get("represents"));

        let abilArray = findObjs({  _type: "ability", _characterid: char.id});
        //clear old abilities
        for(let a=0;a<abilArray.length;a++) {
            abilArray[a].remove();
        } 

        let type = Attribute(char,"type");
        let cross = crossStat(Attribute(char,"cross"));
        let special = Attribute(char,"special");
        if (special === "") {special = " "};

        if (special.includes("Passengers")) {
            abilityName = "Dismount Passengers";
            action = "!DismountPassengers";
            AddAbility(abilityName,action,char.id);        
        }

        if (type === "Aircraft") {
            abilityName = "Arrive ?";
            action = "!EnterAircraft";
            AddAbility(abilityName,action,char.id);
        }

        if (char.get("name").includes("Mine") && type === "System Unit") {
            abilityName = "Minefield Check";
            action = "!MinefieldCheck;@{selected|token_id};@{target|token_id}";
            AddAbility(abilityName,action,char.id);
        }

/*
        abilityName = "Spot";
        action = "!CreateBarrages;@{selected|token_id}";
        AddAbility(abilityName,action,char.id);

        abilityName = "Targets";
        action = "!Targetting";
        AddAbility(abilityName,action,char.id);
*/
        if (type === "Infantry") {
            action = "!Activate;?{Order|Tactical|Dash|Hold|Assault}";
        } else if (type === "Gun") {
            action = "!Activate;?{Order|Tactical|Dash|Hold}";
        } else if (type === "Tank") {
            action = "!Activate;?{Order|Tactical|Dash|Hold|Assault}";
        } else if (type === "Unarmoured Tank") {
            action = "!Activate;?{Order|Tactical|Dash|Hold}";
        } else if (type === "Aircraft") {
            action = "!Activate;Aircraft";
        }
        abilityName = "Orders";
        AddAbility(abilityName,action,char.id);

        let specOrders;
        if (type === "Infantry") {
             specOrders = "!SpecialOrders;?{Special Order|Blitz|Dig In|Follow Me|Shoot and Scoot|Clear Minefield"
        } else if (type === "Gun") {
            specOrders = "!SpecialOrders;?{Special Order|Blitz|Dig In|Follow Me|Shoot and Scoot"
        } else if (type === "Tank") {
            specOrders = "!SpecialOrders;?{Special Order|Blitz|Cross Here|Follow Me|Shoot and Scoot";
            if (special.includes("Mine")) {
                specOrders += "|Clear Minefield";
            }
        } else if (type === "Unarmoured Tank") {
            specOrders = "!SpecialOrders;?{Special Order|Blitz|Cross Here|Follow Me|Shoot and Scoot";
        } 

        specOrders += "}";

        if (type !== "Aircraft" && type !== "System Unit") {
            abilityName = "Special Orders";
            AddAbility(abilityName,specOrders,char.id);
        }

        let team = TeamArray[id];
        if (!team) {return};
        //below relies on using addabilites while token is added to TeamArray

        if (type === "Infantry") {
            abilityName = "Mount/Dismount";
            AddAbility(abilityName,"!MountDismount;@{selected|token_id};@{target|Transport|token_id}",char.id);
        }

/*

        let mgNums = [];
        for (let i=0;i<team.weaponArray.length;i++) {
            let weapon = team.weaponArray[i];
            if (weapon.name.includes("Krasnopol")) {continue}; //only fired by observer
            let wNum = i+1;
            if (weapon.type === "Artillery" || weapon.type === "Rockets") {
                if (type === "Aircraft" || type === "Helicopter") {
                    //??
                } else {
                    abilityName = "Preplan";
                    AddAbility(abilityName,"!PlaceRangedIn",char.id);
                }
                continue;
            }
            if (weapon.type.includes("MG")) {
                mgNums.push(wNum);
                continue;
            }
            let shellType = "Regular";
            if (weapon.notes.includes("Smoke") && weapon.type !== "Artillery") {
                shellType = "?{Fire Smoke|No,Regular|Yes,Smoke}";
            }
            abilityName = "Fire: " + weapon.name;
            action = "!Shooting;@{selected|token_id};@{target|token_id};" + wNum + ";" + shellType;
            AddAbility(abilityName,action,char.id);
        }
        if (mgNums.length > 0) {
            abilityName = "Fire: Machine Guns";
            mgNums = mgNums.toString();
            action = "!Shooting;@{selected|token_id};@{target|token_id};" + mgNums;
            AddAbility(abilityName,action,char.id);
        }
*/



    }

    const AddAbility = (abilityName,action,charID) => {
        createObj("ability", {
            name: abilityName,
            characterid: charID,
            action: action,
            istokenaction: true,
        })
    }









    const changeGraphic = (tok,prev) => {
        if (tok.get('subtype') === "token") {
            //RemoveLines();
            log(tok.get("name") + " moving");
            if ((tok.get("left") !== prev.left) || (tok.get("top") !== prev.top)) {
                let team = TeamArray[tok.id];
                if (!team) {return};
                let oldHex = team.hex;
                let oldHexLabel = team.hexLabel;
                let newLocation = new Point(tok.get("left"),tok.get("top"));
                let newHex = pointToHex(newLocation);
                let newHexLabel = newHex.label();
                newLocation = hexToPoint(newHex); //centres it in hex
                let newRotation = oldHex.angle(newHex);
                tok.set({
                    left: newLocation.x,
                    top: newLocation.y,
                    rotation: newRotation,
                });
                team.hex = newHex;
                team.hexLabel = newHexLabel;
                team.location = newLocation;
                let index = hexMap[oldHexLabel].tokenIDs.indexOf(tok.id);
                if (index > -1) {
                    hexMap[oldHexLabel].tokenIDs.splice(index,1);
                }
                hexMap[newHexLabel].tokenIDs.push(tok.id);
               
            };
/*
            if ((tok.get("height") !== prev.height || tok.get("width") !== prev.width) && state.CoC.labmode === false) {
                let team = TeamArray[tok.id];
                if (!team) {return};
                tok.set("height",prev.height);
                tok.set("width",prev.width);
            }
*/

        };
    };

    const handleInput = (msg) => {
        if (msg.type !== "api") {
            return;
        }
        let args = msg.content.split(";");
        log(args);
        switch(args[0]) {
            case '!Dump':
                log("STATE");
                log(state.FOW4);
                log("Terrain Array");
                log(TerrainArray);
                log("Hex Map");
                log(hexMap);
                log("Team Array");
                log(TeamArray);
                log("Unit Array");
                log(UnitArray);
                log("Formation Array");
                log(FormationArray);
                break;
            case '!TokenInfo':
                TokenInfo(msg);
                break;
            case '!CheckLOS':
                CheckLOS(msg);
                break;
            case '!ClearState':
                ClearState();
                break;
            case '!Roll':
                RollD6(msg);
                break;
            case '!UnitCreation':
                UnitCreation(msg);
                break;
            case '!UnitCreation2':
                UnitCreation2(msg);
                break;
            case '!TestLOS':
                TestLOS(msg);
                break;
            case '!SetupGame':
                SetupGame(msg);
                break;
            case '!GM':
                GM();
                break;
            case '!Activate':
                ActivateUnit(msg);
                break;
            case '!SpecialOrders':
                SpecialOrders(msg);
                break;
            case '!AddAbilities':
                AddAbilities(msg);
                break;

        }
    };

















    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:graphic',changeGraphic);
        //on('destroy:graphic',destroyGraphic);
    };

    on('ready', () => {
        log("===> Flames of War v4 <===");
        log("===> Software Version: " + version + " <===");
        LoadPage();
        BuildMap();
        registerEventHandlers();
        sendChat("","API Ready, Map Loaded")
        log("On Ready Done")
    });
    return {
        // Public interface here
    };
})();