const FOW4 = (() => { 
    const version = '4.10.15';
    if (!state.FOW4) {state.FOW4 = {}};

    //Constants and Persistent Variables

    const pageInfo = {name: "",page: "",gridType: "",scale: 0,width: 0,height: 0};
    const rowLabels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","BB","CC","DD","EE","FF","GG","HH","II","JJ","KK","LL","MM","NN","OO","PP","QQ","RR","SS","TT","UU","VV","WW","XX","YY","ZZ","AAA","BBB","CCC","DDD","EEE","FFF","GGG","HHH","III","JJJ","KKK","LLL","MMM","NNN","OOO","PPP","QQQ","RRR","SSS","TTT","UUU","VVV","WWW","XXX","YYY","ZZZ"];

    let TerrainArray = {};
    let TeamArray = {}; //Individual Squads, Tanks etc
    let UnitArray = {}; //Units of Teams eg. Platoon
    let FormationArray = {}; //to track formations
    let SmokeArray = {};
    let FoxholeArray = [];
    let CheckArray = []; //used by Remount, Rally and Morale checks

    let unitCreationInfo = {}; //used during unit creation 
    let unitIDs4Saves = []; //used during shooting routines

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
        "radio": "status_Radio::5864350",
        "aafire": "status_sentry-gun",
    }

    let specialInfo = {

        "Bazooka Skirts": "Side Armour increased to 5 against Infantry Weapons with FP 5+ or 6",
        "Bombs": "Bombs do not need to re-roll successful To Hit rolls for having only 1 or 2 weapons firing",
        "Brutal": "Infantry, Gun and Unarmoured Tank Teams re-roll successful Saves against Brutal Weapons",
        "Dedicated AA": "Dedicated AA Weapons can Shoot at Aircraft using their Halted ROF",
        "Flamethrower": "",
        "Forward Firing": "Forward Firing Weapons can only target Teams fully in front of the Shooter",
        "Gun Shield": "Gives Bulletproof Cover when shot at from the Front. No protection against Bombardments or if the Team moved at Dash speed",
        "HEAT": "A Team's Armour is not increased by +1 if at long Range vs HEAT",
        "Heavy Weapon": "A Heavy Weapon Team cannot Charge into Contact",
        "HQ": "HQ Team",
        "Independent": "An Independent Team",
        "Large Gun": 'Cannot be placed in Buildings and cannot be placed from Ambush within 16" of enemy',
        "Limited 1": "Each time the Unit  shoots, one of its Teams may shoot this weapon rather than its usual weapons",
        "No HE": "A weapon with no HE targetting an Infantry or Gun Team add +1 to the score needed To Hit",
        "Old Hand": 'An Old Hand Commander gives Units from their Formation whose Unit Leader is within 6" a Tactics rating of 3+',
        "Observer": "Observer Teams can Sport for any friendly Artillery Unit",
        "Overhead Fire": "Grenade Launchers and Light Mortars capable of Overhead Fire can fire over friendly team",
        "Overworked": "Overworked weapons add +1 to the score needed To Hit when moving",
        "Passengers #": "A Transport Team can carry # Infantry Teams as Passengers",
        "Pinned ROF 1": "These weapons have a ROF of 1 when Pinned Down",
        "Salvo": "Use a larger Artillery Template",
        "Scout": "Scouts are Gone to Ground unless they Shoot or Assault. This means that if they are Concealed, the enemy will suffer an additional +1 penalty to hit them",
        "Self Defence AA": "Self-Defence AA weapons can Shoot at Aircraft with ROF 1",
        "Slow Firing": "Slow Firing Weapons add +1 to the score needed To Hit when moving",
        "Smoke": "Smoke weapons can Shoot Smoke ammunition",
        "Smoke Bombardment": "Once per game, the weapon can fire a Smoke Bombardment",
        "Spearhead": "Special Rules for Deployment (page 93)",
        "Stormtroopers": "The Unit may attempt a second Special Order after succeeding in its first Special Order. The second Movement Order must be different from the first.",
        "Tractor": "A Tractor Team can tow a single Gun Team as a Passenger, placing the Gun Team behind it",
        "Unarmoured": "An Unarmoured Tank Team cannot Charge into Contact and must Break Off if assaulted",
        "Unit Transport": 'The Unit Leader of the Transport Attachment must end the Movement Step within 6”/15cm of the Unit Leader of its Passenger Unit while on table. If it cannot do this, then the Transport Attachment must be Sent to the Rear.'

    }




    const PM = ["status_Green-01::2006603","status_Green-02::2006607","status_Green-03::2006611"];

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
            "platoonmarkers": ["letters_and_numbers0099::4815235","letters_and_numbers0100::4815236","letters_and_numbers0101::4815237","letters_and_numbers0102::4815238","letters_and_numbers0103::4815239","letters_and_numbers0104::4815240","letters_and_numbers0105::4815241","letters_and_numbers0106::4815242","letters_and_numbers0107::4815243","letters_and_numbers0108::4815244","letters_and_numbers0109::4815245","letters_and_numbers0110::4815246","letters_and_numbers0111::4815247","letters_and_numbers0112::4815248","letters_and_numbers0113::4815249","letters_and_numbers0114::4815250","letters_and_numbers0115::4815251","letters_and_numbers0116::4815252","letters_and_numbers0117::4815253","letters_and_numbers0118::4815254","letters_and_numbers0119::4815255","letters_and_numbers0120::4815256","letters_and_numbers0121::4815257","letters_and_numbers0122::4815258","letters_and_numbers0123::4815259","letters_and_numbers0124::4815260"],
        },
        "Germany": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/324330922/vm_sbQZSkc81fR4CtQp57g/thumb.png?1674494502",
            "dice": "Germany",
            "backgroundColour": "#555C5F",
            "titlefont": "Bokor",
            "fontColour": "#FFFFFF",
            "borderColour": "#000000",
            "borderStyle": "5px double",
            "platoonmarkers": ["letters_and_numbers0197::4815333","letters_and_numbers0198::4815334","letters_and_numbers0199::4815335","letters_and_numbers0200::4815336","letters_and_numbers0201::4815337","letters_and_numbers0202::4815338","letters_and_numbers0203::4815339","letters_and_numbers0204::4815340","letters_and_numbers0205::4815341","letters_and_numbers0206::4815342","letters_and_numbers0207::4815343","letters_and_numbers0208::4815344","letters_and_numbers0209::4815345","letters_and_numbers0210::4815346","letters_and_numbers0211::4815347","letters_and_numbers0212::4815348","letters_and_numbers0213::4815349","letters_and_numbers0214::4815350","letters_and_numbers0215::4815351","letters_and_numbers0216::4815352","letters_and_numbers0217::4815353","letters_and_numbers0218::4815354","letters_and_numbers0219::4815355","letters_and_numbers0220::4815356","letters_and_numbers0221::4815357","letters_and_numbers0222::4815358"],
        },
        "UK": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/330506939/YtTgDTM3q7p8m0fJ4-E13A/thumb.png?1677713592",
            "backgroundColour": "#0E2A7A",
            "dice": "UK",
            "titlefont": "Merriweather",
            "fontColour": "#FFFFFF",
            "borderColour": "#BC2D2F",
            "borderStyle": "5px groove",
            "platoonmarkers": ["letters_and_numbers0148::4815284","letters_and_numbers0149::4815285","letters_and_numbers0150::4815286","letters_and_numbers0151::4815287","letters_and_numbers0152::4815288","letters_and_numbers0153::4815289","letters_and_numbers0154::4815290","letters_and_numbers0155::4815291","letters_and_numbers0156::4815292","letters_and_numbers0157::4815293","letters_and_numbers0158::4815294","letters_and_numbers0159::4815295","letters_and_numbers0160::4815296","letters_and_numbers0161::4815297","letters_and_numbers0162::4815298","letters_and_numbers0163::4815299","letters_and_numbers0164::4815300","letters_and_numbers0165::4815301","letters_and_numbers0166::4815302","letters_and_numbers0167::4815303","letters_and_numbers0168::4815304","letters_and_numbers0169::4815305","letters_and_numbers0170::4815306","letters_and_numbers0171::4815307","letters_and_numbers0172::4815308","letters_and_numbers0173::4815309"],
        },
        "USA": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/327595663/Nwyhbv22KB4_xvwYEbL3PQ/thumb.png?1676165491",
            "backgroundColour": "#FFFFFF",
            "dice": "USA",
            "titlefont": "Arial",
            "fontColour": "#006400",
            "borderColour": "#006400",
            "borderStyle": "5px double",
            "platoonmarkers": ["letters_and_numbers0050::4815186","letters_and_numbers0051::4815187","letters_and_numbers0052::4815188","letters_and_numbers0053::4815189","letters_and_numbers0054::4815190","letters_and_numbers0055::4815191","letters_and_numbers0056::4815192","letters_and_numbers0057::4815193","letters_and_numbers0058::4815194","letters_and_numbers0059::4815195","letters_and_numbers0060::4815196","letters_and_numbers0061::4815197","letters_and_numbers0062::4815198","letters_and_numbers0063::4815199","letters_and_numbers0064::4815200","letters_and_numbers0065::4815201","letters_and_numbers0066::4815202","letters_and_numbers0067::4815203","letters_and_numbers0068::4815204","letters_and_numbers0069::4815205","letters_and_numbers0070::4815206","letters_and_numbers0071::4815207","letters_and_numbers0072::4815208","letters_and_numbers0073::4815209","letters_and_numbers0074::4815210","letters_and_numbers0075::4815211"],
        },
        "Waffen-SS": {
            "image": "https://s3.amazonaws.com/files.d20.io/images/324283125/RG-Yo1FkEWvzDprUsFl3Cg/thumb.png?1674447941",
            "backgroundColour": "#000000",
            "dice": "SS",
            "titlefont": "Bokor",
            "fontColour": "#FFFFFF",
            "borderColour": "#FF0000",
            "borderStyle": "5px ridge",
            "platoonmarkers": ["letters_and_numbers0197::4815333","letters_and_numbers0198::4815334","letters_and_numbers0199::4815335","letters_and_numbers0200::4815336","letters_and_numbers0201::4815337","letters_and_numbers0202::4815338","letters_and_numbers0203::4815339","letters_and_numbers0204::4815340","letters_and_numbers0205::4815341","letters_and_numbers0206::4815342","letters_and_numbers0207::4815343","letters_and_numbers0208::4815344","letters_and_numbers0209::4815345","letters_and_numbers0210::4815346","letters_and_numbers0211::4815347","letters_and_numbers0212::4815348","letters_and_numbers0213::4815349","letters_and_numbers0214::4815350","letters_and_numbers0215::4815351","letters_and_numbers0216::4815352","letters_and_numbers0217::4815353","letters_and_numbers0218::4815354","letters_and_numbers0219::4815355","letters_and_numbers0220::4815356","letters_and_numbers0221::4815357","letters_and_numbers0222::4815358"],
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
            this.order = "";
            this.specialorder = "";
            this.nation = nation;
            this.formationID = formationID;
            this.teamIDs = [];
            this.hqUnit = false;
            this.type = "";
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
                this.type = team.type;
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

        pinned() {
            let pinned = false;
            let leaderTeam = TeamArray[this.teamIDs[0]];
            if ((leaderTeam.type === "Infantry" || leaderTeam.type === "Gun") && (leaderTeam.token.get("aura1_color") === Colours.yellow)) {
                pinned = true;
            }
            return pinned;
        }

        unpin() {
            let leaderTeam = TeamArray[this.teamIDs[0]];
            leaderTeam.token.set("aura1_color",Colours.green);
        }



    }

    class Team {
        constructor(tokenID,formationID,unitID) {
            let token = findObjs({_type:"graphic", id: tokenID})[0];
            if (!token) {sendChat("","No Token?"); return}
            let char = getObj("character", token.get("represents")); 
            if (!char) {sendChat("","No Character?"); return}
            let charName = char.get("name");
            let attributeArray = AttributeArray(char.id);
            let nation = attributeArray.nation;
            let player = (Allies.includes(nation)) ? 0:1;
            if (nation === "Neutral") {player = 2};

            let type = attributeArray.type;
            let location = new Point(token.get("left"),token.get("top"));
            let hex = pointToHex(location);
            let hexLabel = hex.label();
            let infoArray = [];

            //create array of weapon info
            let weaponArray = [];
            let artillery;
            let artFlag = false;
            let artNum = 0;
            let bestAT = -1;
            let bestFP = 7;
            let bestATWpnNum;
            for (let i=1;i<5;i++) {
                let name = attributeArray["weapon"+i+"name"];
                if (!name || name == " " || name == "") {continue};
                if (name.includes("(") || name.includes(")")) {
                    name = name.replace("(","[");
                    name = name.replace(")","]");
                    AttributeSet(character.id,"weapon"+i+"name",name);
                }
                let fp = attributeArray["weapon"+i+"fp"];
                if (fp === "AUTO") {
                    fp = 1;
                } else {
                    fp = Number(attributeArray["weapon"+i+"fp"].replace(/[^\d]/g, ""));
                }
                let notes = attributeArray["weapon"+i+"notes"];
                if (!notes || notes === "") {notes = " "};

                let halted = parseInt(attributeArray["weapon"+i+"halted"]);
                if (!halted || halted === "") {halted = 0};

                let moving = parseInt(attributeArray["weapon"+i+"moving"]);
                if (!moving || moving === "") {moving = 0};

                let rangeText = attributeArray["weapon"+i+"range"];
                rangeText = rangeText.split("-");
                let minRange = 0;
                let maxRange = rangeText[0].replace(/[^\d]/g, "");
                if (rangeText.length > 1) {
                    minRange = rangeText[0].replace(/[^\d]/g, "");
                    maxRange = rangeText[1].replace(/[^\d]/g, "");
                }
                minRange = parseInt(minRange);
                maxRange = parseInt(maxRange);
                let type = attributeArray["weapon"+i+"type"];
                if (!type || type === "") {
                    type = "Small Arms";
                }
                let at = parseInt(attributeArray["weapon"+i+"at"]);
                if (at > bestAT || at === bestAT && fp < bestFP) {
                    bestATWpnNum = (i-1);
                    bestAT = at;
                    bestFP = fp;
                }

                let weapon = {
                    name: name,
                    minRange: minRange,
                    maxRange: maxRange,
                    halted: halted,
                    moving: moving,
                    at: at,
                    fp: fp,
                    notes: notes,
                    type: type,
                }
                if (notes.includes("Heavy Weapon")) {
                    if (special === " ") {
                        special = "Heavy Weapon"
                    } else {
                        special += ",Heavy Weapon";
                    }
                }

                if (notes !== " ") {
                    //puts info on weapon specials on sheet
                    let ws = notes.split(",");
                    for (let s=0;s<ws.length;s++) {
                        let wss = ws[s].trim();
                        infoArray.push(wss);
                    }
                }


                weaponArray.push(weapon);
                if (halted === "Artillery" || halted === "Salvo" || moving === "Artillery" || moving === "Salvo") {
                    artFlag = true;
                    artillery = weapon;
                    artNum = i;
                };
            }

            if (bestAT <= 2) {
                bestATWpnNum = 5; //Hand Grenades
            }
log("BestAT: " + bestAT)
log("#: " + bestATWpnNum)


            //update sheet with info
            let specials = attributeArray.special;
            if (!specials || specials === "") {
                specials = " ";
            }
            specials = specials.split(",");
            for (let i=0;i<specials.length;i++) {
                let special = specials[i].trim();
                let attName = "special" + i;
                AttributeSet(char.id,attName,special);
                infoArray.push(special);
            }

            infoArray = [...new Set(infoArray)];

            infoArray.sort(function (a,b) {
                let a1 = a.charAt(0).toLowerCase();
                let b1 = b.charAt(0).toLowerCase();
                if (a1<b1) {return -1};
                if (a1>b1) {return 1};
                return 0;
            });

            for (let i=0;i<10;i++) {
                let specName = infoArray[i];
                if (!specName || specName === "") {continue}
                if (specName.includes("(")) {
                    let index = specName.indexOf("(");
                    specName = specName.substring(0,index);
                    specName += "(X)";
                }
                if (specName.includes("+")) {
                    let index = specName.indexOf("+");
                    specName = specName.substring(0,index);
                    specName += "+X";
                }
                let specInfo = specialInfo[specName];
                if (specName) {
                    specName += ": ";
                }
                if (!specInfo && specName) {
                    specInfo = "Not in Database Yet";
                }
                let atName = "spec" + (i+1) + "Name";
                let atText = "spec" + (i+1) + "Text";

                if (!specName) {
                    DeleteAttribute(char.id,atName);
                } else {
                    AttributeSet(char.id,atName,specName);
                    AttributeSet(char.id,atText,specInfo);
                }
            }

            let special = infoArray.toString();
            if (!special || special === "" || special === " ") {
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

/*
            //passengers
            let maxPass = 0;
            if (type === "Tank") {
                maxPass = 3;
            }
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

            this.order = "";
            this.specialorder = "";

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
            this.nightvisibility = 0;

            this.hex = hex; //axial
            this.hexLabel = hexLabel; //doubled
            this.rotation = token.get("rotation");
            this.special = special;
            this.unique = unique;
            //this.transport = ""; //id of transport if a passenger
            //this.passengers = []; //id of any passengers
            this.weaponArray = weaponArray;
            this.hitArray = [];
            this.eta = [];
            //this.maxPass = maxPass;

            TeamArray[tokenID] = this;
            hexMap[hexLabel].tokenIDs.push(tokenID);

        }

        inCommand() {
            let inC = false;
            let unit = UnitArray[this.unitID];
            let unitLeader = TeamArray[unit.teamIDs[0]];
            let unitSize = unit.teamIDs.length;
            let commandRadius = 6;
            if (unitSize >= 8) {
                commandRadius = 8;
            }
            if (this.hex.distance(unitLeader.hex) <= commandRadius) {
                inC = true;
            }
            return inC;
        }

        bailed() {
            let bailed = false;
            if (this.token.get("aura1_color") === Colours.yellow) {
                bailed = true;
            }
            return bailed;
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

    const Unique = (array,label) => {
        //eliminate duplicate objects in array using a label eg. name if sorting on obj.name
        array = array.reduce((unique, o) => {
            if(!unique.some(obj => obj[label] === o[label])) {
              unique.push(o);
            }
            return unique;
        },[]);
        return array;
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
        FoxholeArray = [];
        
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
            //transports: {},
            //passengers: {},
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
            let unitMarker = returnCommonElements(statusmarkers,Nations[nation].platoonmarkers);
            let unitNumber = Nations[nation].platoonmarkers.indexOf(unitMarker);

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
            let C1 = vertices1[i]
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

        let formationKeys = Object.keys(FormationArray);
        let supportFlag = false;
        if (formationKeys.length > 0) {
            for (let i=0;i<formationKeys.length;i++) {
                let formation = FormationArray[formationKeys[i]];
                if (formation.nation !== nation) {continue}
                if (formation.name === "Support") {
                    supportFlag = true;
                    break;
                }
            }
        }

        if (supportFlag === false) {
            support = new Formation(player,nation,stringGen(),"Support");
        }

        let newID = stringGen();
        SetupCard("Unit Creation","",nation);
        outputCard.body.push("Select Existing Formation or New");

        ButtonInfo("New","!UnitCreation2;" + newID + ";?{Formation Name}");
        formationKeys = Object.keys(FormationArray); //redone as Support may have been added

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
        let unitMarker = Nations[nation].platoonmarkers[unit.number];
        formation.add(unit);

        log(formation)
        log(unit)
        

        let basegmn = formation.name + ";" + formation.id + ";" + unitName + ";" + unit.id + ";";

        for (let i=0;i<teamIDs.length;i++) {
            let team = new Team(teamIDs[i],formationID,unit.id);
            if (!team) {continue};
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
            if (team.type === "Aircraft") {
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
        if (team.inCommand() === true) {
            outputCard.body.push("Team is In Command");
        } else {
            outputCard.body.push("Team is NOT In Command");
        }
        if (team.order === "") {
            outputCard.body.push("No Order this Turn");
        } else {
            outputCard.body.push("Team Order: " + team.order);
        }
        if (team.specialorder !== "") {
            outputCard.body.push("Special Order: " + team.specialorder);
        }
        outputCard.body.push("[hr]");
        outputCard.body.push("Unit: " + unit.name);
        for (let i=0;i<unit.teamIDs.length;i++) {
            let m = TeamArray[unit.teamIDs[i]];
            outputCard.body.push(m.name);
        }
        if (unit.order === "") {
            outputCard.body.push("No Order this Turn");
        } else {
            outputCard.body.push("Unit Order: " + unit.order);
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
            if (team1.nightvisibility > 0) {
                nightVisibility = team1.nightvisibility;
            } else {
                nightVisibility = randomInteger(6) * 4;
                team1.nightvisibility = nightVisibility;
            }
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
    //log("Team1 H: " + team1Height)
    //log("Team2 H: " + team2Height)
    
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
                special: special,
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
    //log(i + ": " + qrsLabel)
    //log(interHex.terrain)
    //log("Type: " + interHex.type)
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
        //log("InterHex Height: " + interHexHeight);
        //log("InterHex Elevation: " + interHexElevation);
        //log("Last Elevation: " + lastElevation);
        //log("B: " + B)
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
            //log("Friendlies")
                        for (let t=0;t<fKeys.length;t++) {
                            let fm = TeamArray[fKeys[t]];
                            if (fm.id === team1.id || fm.id === team2.id || fm.player !== team1.player || fm.unitID === team1.unitID) {continue};
                            if (fm.type === "Infantry" && fm.token.get(SM.tactical) === false && fm.token.get(SM.dash) === false) {continue}; //ignore these infantry
                            let dis = fm.hex.distance(qrs);
                            if (dis < 2) {
            //log(fm.name)
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
        //log("Terrain higher than B")
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
        //log("Terrain less than B")

                    }
                }
            }
            if (team2.type === "Infantry" && team2.token.get(SM.tactical) === false && team2.token.get(SM.dash) === false) {
                concealed = true //infantry teams that didnt move are concealed to all but Aircraft
        //log("Infantry didnt move = Concealed")
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
            special: special,
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
        let order = Tag[1];

        ActivateUnitTwo(teamID,order);
    }

    const ActivateUnitTwo = (teamID,order,specialorder) => {
        let team = TeamArray[teamID];
        let unit = UnitArray[team.unitID];
        let inCommand = team.inCommand();
        let unitLeader = TeamArray[unit.teamIDs[0]];
        let targetTeam,targetName;
        let targetArray = [];
        let sms = [SM.tactical,SM.dash,SM.hold,SM.assault];

        if (inCommand === true) {
            targetTeam = unitLeader;
            targetName = unit.name;
            for (let i=0;i<unit.teamIDs.length;i++) {
                let tm = TeamArray[unit.teamIDs[i]];
                if (tm.inCommand() === true) {
                    targetArray.push(tm);
                }
            }
        } else {
            targetTeam = team;
            targetName = team.name;
            targetArray = [targetTeam];
        }

        if (!specialorder) {
            specialorder = "";
            SetupCard(targetName,order,unit.nation);
        };

        for (let i=0;i<targetArray.length;i++) {
            for (let j=0;j<sms.length;j++) {
                targetArray[i].token.set(sms[j],false);
            }
        }

        let noun = "Teams ";
        let verb = " are ";
        let noun2 = " their ";

        let extraLine = ""
        if (inCommand === false) {
            noun = "The Team ";
            verb = " is ";
            noun2 = " its ";
            outputCard.body.push("Out of Command Team");
            outputCard.body.push("[hr]");
            if (order === "Assault") {
                outputCard.body.push("Team defaults to a Tactical Order");
                order = "Tactical";
            };
            if (order === "Tactical") {
                extraLine = "Firing suffers an additional +1 Penalty";
            } else if (order === "Dash") {
                extraLine = "It should move towards the Unit Leader";
            } 
        }

        if (targetTeam.specialorder === "Failed Blitz" && order === "Dash") {
            outputCard.body.push("Team defaults to a Tactical Order");
            order = "Tactical";
        }
        if (targetTeam.specialorder === "Cross Here" && order !== "Dash") {
            outputCard.body.push("Team defaults to a Dash Order");
            order = "Tactical";
        }
        if (order === "Assault") {
            if (unit.pinned() === true) {
                outputCard.body.push("Team is Pinned, cannot Assault");
                outputCard.body.push("Team defaults to a Tactical Order");
                order = "Tactical";
            }
            //shot at aircraft prev turn here
            if (targetTeam.token.get(SM.radio) === true) {
                outputCard.body.push("Unit/Team called in Artillery, cannot Assault");
                outputCard.body.push("Team defaults to a Tactical Order");
                order = "Tactical";
            }
        }


        let marker;
        if (order.includes("Tactical")) {
            if (specialorder.includes("Dig In") === false) {
                outputCard.body.push(noun + "can move at Tactical Speed, and may fire at" + noun2 + "Moving ROF");
                outputCard.body.push(noun + 'cannot move within 2 hexes of enemies');
            }
            marker = SM.tactical
        } else if (order.includes("Dash")) {
            outputCard.body.push(noun + ' can move at Dash Speed, but may not fire');
            outputCard.body.push(noun + ' cannot move within 8 hexes of visible enemies');
            if (state.FOW4.darkness === true) {
                outputCard.body.push("Darkness limits speed to Terrain Dash");
            }
            marker = SM.dash
        } else if (order.includes("Hold")) {
            outputCard.body.push(noun + " stay in place, and may fire at" + noun2 + "Halted ROF");
            outputCard.body.push(noun + verb + "Gone to Ground if not Firing");
            marker = SM.hold;
        } else if (order.includes("Assault")) {
            outputCard.body.push('Teams can move at Tactical Speed to a Max of 10 hexes, and may fire at their Moving ROF');
            outputCard.body.push('Teams must target an enemy within 8 hexes of the Team it will charge into');
            outputCard.body.push("Eligible Teams can complete the charge");
            marker = SM.assault;
        } 


        outputCard.body.push(extraLine);
        for (let i=0;i<targetArray.length;i++) {
            targetArray[i].token.set(marker,true);
            targetArray[i].order = order;
            if (targetArray[i].specialorder === "") {
                targetArray[i].specialorder = specialorder;
            } else {
                outputCard.body.push('[' + targetArray[i].name + " already has " + targetArray[i].specialorder + "]");
            }
        }
        if (inCommand === true) {
            unit.order = order;
            unit.specialorder = specialorder;
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
/*
        if (special.includes("Passengers")) {
            abilityName = "Dismount Passengers";
            action = "!DismountPassengers";
            AddAbility(abilityName,action,char.id);        
        }
*/
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
             specOrders = "!SpecialOrders;?{Special Order|Blitz & Move|Blitz & Hold|Dig In|Follow Me|Shoot and Scoot|Clear Minefield"
        } else if (type === "Gun") {
            specOrders = "!SpecialOrders;?{Special Order|Dig In|Cross Here"
        } else if (type === "Tank") {
            specOrders = "!SpecialOrders;?{Special Order|Blitz & Move|Blitz & Hold|Cross Here|Follow Me|Shoot and Scoot";
            if (special.includes("Mine")) {
                specOrders += "|Clear Minefield";
            }
        } else if (type === "Unarmoured Tank") {
            specOrders = "!SpecialOrders;?{Special Order|Blitz & Move|Blitz & Hold|Cross Here|Follow Me|Shoot and Scoot";
        } 

        specOrders += "}";

        if (type !== "Aircraft" && type !== "System Unit") {
            abilityName = "Special Orders";
            AddAbility(abilityName,specOrders,char.id);
        }

        let team = TeamArray[id];
        if (!team) {return};
        //below relies on using addabilites while token is added to TeamArray
/*
        if (type === "Infantry") {
            abilityName = "Mount/Dismount";
            AddAbility(abilityName,"!MountDismount;@{selected|token_id};@{target|Transport|token_id}",char.id);
        }
*/
        if (team.cross > 1) {
            abilityName = "Cross";
            AddAbility(abilityName,"!Cross",char.id);
        }

        let mg = false;
        for (let i=0;i<team.weaponArray.length;i++) {
            let weapon = team.weaponArray[i];
            let abName = weapon.name;
            let wtype = weapon.type;
            if (weapon.type.includes("MG")) {
                wtype = "MG"
                if (mg === true) {
                    continue;
                } else {
                    abName = "MGs"
                    mg = true;
                }
            }

            let shellType = "Regular";
            if (weapon.notes.includes("Smoke") && weapon.type !== "Artillery") {
                shellType = "?{Fire Smoke|No,Regular|Yes,Smoke}";
            }
            abilityName = "Fire: " + abName;
            action = "!Shooting;@{selected|token_id};@{target|token_id};" + wtype + ";" + shellType;
            AddAbility(abilityName,action,char.id);
        }



    }

    const AddAbility = (abilityName,action,charID) => {
        createObj("ability", {
            name: abilityName,
            characterid: charID,
            action: action,
            istokenaction: true,
        })
    }

    const Cross = (msg) => {
        if (!msg) {return}
        let id = msg.selected[0]._id;
        if (!id) {return};
        let team = TeamArray[id];
        SetupCard(team.name,"Cross",team.nation);
        let roll = randomInteger(6);
        let cross = team.cross;
        if (team.specialorder === "Cross Here") {
            cross--;
        }
        if (state.FOW4.darkness === true) {
            cross++;
        }
        SetupCard(team.name,"vs. " + cross + "+",team.nation);
        outputCard.body.push("Roll: " + DisplayDice(roll,team.nation,24));
        if (roll >= cross) {
            outputCard.body.push("Success");
        } else {
            outputCard.body.push("Failure!<br>The Team stops where it is");
        }
//Leader Team Option to swap
        PrintCard();
    }

    const SpecialOrders = (msg) => {
        //RemoveLines();
        //!Orders;?{Order|Blitz|Cross Here|Dig In|Follow Me|Shoot and Scoot} - and which varies by team type
        let Tag = msg.content.split(";");
        let teamID = msg.selected[0]._id;
        let specialorder = Tag[1];
        let team = TeamArray[teamID];
        let unit = UnitArray[team.unitID];
        let unitLeader = TeamArray[unit.teamIDs[0]];
        SetupCard(unit.name,specialorder,team.nation);
        let errorMsg = [];
        
        let roll = randomInteger(6);
        let stat = 1;

        if (specialorder === "Clear Minefield") {
            targetTeam = team;
        } else {
            targetTeam = unitLeader;
        }

        if (targetTeam.specialorder !== "") {
            errorMsg.push("Teams can only have one Special Order per turn");
        }

        let movedFlag = (targetTeam.token.get(SM.dash) === true || targetTeam.token.get(SM.tactical) === true) ? true:false;
        
        if (specialorder === "Blitz") {
            if (movedFlag === true) {
                errorMsg.push("Blitz Order must be given before movement");
            }
        }
        if (specialorder === "Shoot and Scoot") {
            if (movedFlag === true) {
                errorMsg.push("Unit has Moved and so cannot be given a Shoot and Scoot Order");
            }
        }
        if (specialorder === "Dig In") {
            if (movedFlag === true) {
                errorMsg.push("Unit has Moved and so cannot be given a Dig In Order");
            }        
        }
        if (targetTeam.token.get(SM.fired) === true && specialorder !== "Shoot and Scoot") {
            errorMsg.push("Unit has Fired this turn, cannot be given that Order");
        }
        if (specialorder === "Clear Minefield") {
            if (movedFlag === true) {
                errorMsg.push("Team has already Moved");
            }
        }

        if (errorMsg.length > 0) {
            for (let i=0;i<errorMsg.length;i++) {
                outputCard.body.push(errorMsg[i]);
            }
            PrintCard();
            return;
        }
        let line = DisplayDice(roll,unitLeader.nation,24) + " vs. ";
        if (specialorder === "Cross Here" || specialorder === "Clear Minefield") {
            line = "Auto";
        } else if (specialorder === "Follow Me") {
            stat = unitLeader.motivation;
            line += stat + "+  ";
        } else {
            stat = unitLeader.skill;
            line += stat + "+  ";
        }
        if (roll >= stat) {
            line += " Success!";
        } else {
            line += " Failure!";
        }
        
        outputCard.body.push(line);

        switch (specialorder) {
            case "Blitz & Move":
                if (roll >= stat) {
                    outputCard.body.push("The Unit Leader and any Teams that are In Command may immediately Move up to 4 hexes before making a normal Tactical Move");
                    /*
                    if (unitLeader.token.get(SM.mounted) === true) {
                        outputCard.body.push("The Unit dismounts as part of this Blitz Move");
                        for (let i=0;i<unit.inCommandIDs.length;i++) {
                            let id = unit.inCommandIDs[i];
                            if (TeamArray[id].token.get(SM.mounted) === true) {
                                let transID = state.FOW4.passengers[id];
                                RemovePassenger(id);
                                DismountPassengersTwo(id,transID);
                            }
                        }
                    }
                    */
                } else {    
                    outputCard.body.push("Teams from the Unit can only Move at Tactical speed and automatically suffer a +1 to hit penalty as if they had Moved Out of Command");
                    specialorder = "Failed Blitz";
                }
                ActivateUnitTwo(unitLeader.id,"Tactical",specialorder);
                break;
            case "Blitz & Hold":
                if (roll >= stat) {
                    outputCard.body.push("The Unit Leader and any Teams that are In Command may immediately Move up to 4 hexes and then take up a Hold Order");
                    /*
                    if (unitLeader.token.get(SM.mounted) === true) {
                        outputCard.body.push("The Unit dismounts as part of this Blitz Move");
                        for (let i=0;i<unit.inCommandIDs.length;i++) {
                            let id = unit.inCommandIDs[i];
                            if (TeamArray[id].token.get(SM.mounted) === true) {
                                let transID = state.FOW4.passengers[id];
                                RemovePassenger(id);
                                DismountPassengersTwo(id,transID);
                            }
                        }
                    }
                    */
                    ActivateUnitTwo(unitLeader.id,"Hold",specialorder);
                } else {    
                    outputCard.body.push("Teams from the Unit count as Moving at Tactical speed and automatically suffer a +1 to hit penalty as if they had Moved Out of Command");
                    specialorder = "Failed Blitz";
                    ActivateUnitTwo(unitLeader.id,"Tactical",specialorder);
                }
                break;
            case "Cross Here":
                outputCard.body.push("Any Teams (including the Unit Leader) from the Unit rolling to Cross Difficult Terrain within 6 hexes of where the Unit Leader crosses improve their chance of crossing safely, reducing the score they need to pass a Cross Test by 1.");
                ActivateUnitTwo(unitLeader.id,"Dash",specialorder);
                break;
            case "Dig In":
                if (roll >= stat) {
                    outputCard.body.push("In Command Infantry Teams Dig In");
                    DigIn(unit);
                } else {
                    outputCard.body.push("The Unit failed to Dig In");
                    specialorder = "Failed Dig In";
                }
                outputCard.body.push("The Teams can fire at their moving ROF (but cannot fire a Bombardment)");
                outputCard.body.push("If they do not Shoot or Assault, they are Gone to Ground");
                ActivateUnitTwo(unitLeader.id,"Tactical",specialorder)
                break;
            case "Follow Me":
                if (roll >= stat) {
                    outputCard.body.push("In Command Teams may immediately Move directly forward up to an additional 4 hexes, remaining In Command.")
                } else {
                    outputCard.body.push("Teams remain where they are")
                    specialorder = "Failed Follow Me";
                }
                outputCard.body.push("Teams may not fire");
                PrintCard();
                break;
            case "Shoot and Scoot":
                if (roll >= stat) {
                    outputCard.body.push("The Leader and any Teams that are In Command and did not Move in the Movement Step may immediately Move up to 4 hexes");
                } else {
                    outputCard.body.push("Teams remain where they are")
                }
                PrintCard();
                break;
            case "Clear Minefield":
                outputCard.body.push('The Team is ordered to clear a Minefield within 2 Hexes');
                outputCard.body.push("That Team counts as having Moved, and cannot Shoot or Assault");
                outputCard.body.push("The Minefield can be removed immediately");
                outputCard.body.push("Other Teams may be given the same order");
                targetTeam.token.set(SM.dash,true);
                targetTeam.specialorder = specialorder;
                PrintCard();
                break;
        }
    }

    const DigIn = (unit) => {
        for (let i=0;i<unit.teamIDs.length;i++) {
            let team = TeamArray[unit.teamIDs[i]];
            if (team.type !== "Infantry" && team.type !== "Gun") {continue};
            if (team.inCommand() === false) {continue};
            let hex = hexMap[team.hexLabel];
            if (hex.terrain.includes("Building") || hex.terrain.includes("Foxholes")) {continue};
            if (hex.terrain.includes("Offboard") || hex.terrain.includes("Reserves")) {continue};
            let dimensions = Math.max(team.token.get("height"), team.token.get("width")) + 25
            let newToken = createObj("graphic", {   
                left: team.location.x,
                top: team.location.y,
                width: dimensions, 
                height: dimensions,
                name: "Foxholes",  
                rotation: 30,
                isdrawing: true,
                pageid: team.token.get("pageid"),
                imgsrc: "https://s3.amazonaws.com/files.d20.io/images/253100240/1FOuKa7fU3YYi0Gf_Yz8DQ/thumb.png?1635623427",
                layer: "map",
                gmnotes: "GM"
            });
            toFront(newToken);
            hexMap[team.hexLabel].terrain.push("Foxholes")
            let fInfo = {
                hexLabel: team.hexLabel,
                id: newToken.id, //id of the Foxholes token, can be used to remove later
            }
            FoxholeArray.push(fInfo);
        }
    }
    
    const RemoveFoxholes = () => {
        let newFoxholes = [];
        for (let i=0;i<FoxholeArray.length;i++) {
            let foxhole = FoxholeArray[i];
            if (hexMap[foxhole.hexLabel].tokenIDs.length === 0) {
                let index = hexMap[foxhole.hexLabel].terrain.indexOf("Foxholes");
                if (index > -1) {
                    hexMap[foxhole.hexLabel].terrain.splice(index,1);
                }
                let tok = findObjs({_type:"graphic", id: foxhole.id})[0];
                if (tok) {
                    tok.remove();
                }
            } else {
                newFoxholes.push(foxhole);
            }
        }
        FoxholeArray = newFoxholes;
    }
    
    const NewTurn = () => {
        //RemoveLines();
        if (state.FOW4.nations[0].length === 0 && state.FOW4.nations[1].length === 0) {
            sendChat("","No Units Created Yet");
            return;
        }
        let turn = state.FOW4.turn;
        let currentPlayer = parseInt(state.FOW4.currentPlayer);
        if (currentPlayer === "") {
            sendChat("","Setup Game First");
            return;
        }
        if (turn === 0 && state.FOW4.gametype === "Meeting Engagement") {
            StartInFoxholes();
        } else {
            currentPlayer = (currentPlayer === 0) ? 1:0;
        }
        if (currentPlayer === state.FOW4.startingPlayer) {
            turn++;
        }
        state.FOW4.turn = turn;
        state.FOW4.currentPlayer = currentPlayer;

        SetupCard("Turn " + turn,"",state.FOW4.nations[currentPlayer][0]);

        if ((state.FOW4.timeOfDay === "Dawn" || state.FOW4.timeOfDay === "Dusk") && currentPlayer === state.FOW4.firstPlayer && turn > 2) {
            let numDice = turn - 2;
            let flip = false;
            for (let i=0;i<numDice;i++) {
                let roll = randomInteger(6);
                if (roll > 4) {
                    flip = true;
                    break;
                }
            }
            if (flip) {
                SetupCard("Time Change","","Neutral");
                if (state.FOW4.timeOfDay === "Dawn") {
                    outputCard.body.push("[#ff0000]Morning has broken, the rest of the battle is fought in Daylight[/#]");
                    state.FOW4.timeOfDay = "Daylight";
                    state.FOW4.darkness = false;
                    pageInfo.page.set("dynamic_lighting_enabled",false);
                }
                if (state.FOW4.timeOfDay === "Dusk") {
                    outputCard.body.push("[#ff0000]Night has fallen, the rest of the battle is fought in Darkness[/#]");
                    state.FOW4.timeOfDay = "Night";
                    state.FOW4.darkness = true;
                    pageInfo.page.set({
                        dynamic_lighting_enabled: true,
                        daylight_mode_enabled: true,
                        daylightModeOpacity: 0.1,
                    })
                }
                PrintCard();
            }
        }

        if (state.FOW4.darkness === true) {
            pageInfo.page.set({
                dynamic_lighting_enabled: true,
                daylight_mode_enabled: true,
                daylightModeOpacity: 0.1,
            })
        } else {
            pageInfo.page.set("dynamic_lighting_enabled",false);
        }

        //start phase with checking for rez'd leaders
        StartPhase("ResLeaders");
    }



    const StartPhase = (pass) => {
        let currentPlayer = parseInt(state.FOW4.currentPlayer);
        let nat = state.FOW4.nations[currentPlayer][0];  
        if (pass === "ResLeaders") {
            ResLeaders();
        }
        if (pass === "Remount") {
            CheckArray = [];
            let keys = Object.keys(UnitArray); 
            for (let i=0;i<keys.length;i++) {
                let unit = UnitArray[keys[i]];
                if (unit.type !== "Tank" || unit.player !== state.FOW4.currentPlayer) {continue};
                let ids = unit.teamIDs;
                for (let j=0;j<ids.length;j++) {
                    let team = TeamArray[ids[j]];
                    if (team.bailed() === true) {
                        CheckArray.push(team);
                    }
                }
            }
            if (CheckArray.length > 0) {
                SetupCard("Remount Checks","",nat);
                ButtonInfo("Start Remount Checks","!RemountChecks");
                PrintCard();            
            } else {
                StartPhase("Rally");
            }
        }
        if (pass === "Rally") {
            CheckArray = [];
            let keys = Object.keys(UnitArray);
            for (let i=0;i<keys.length;i++) {
                let unit = UnitArray[keys[i]];
                if (unit.player !== state.FOW4.currentPlayer || (unit.type !== "Infantry" && unit.type !== "Unarmoured Tank" && unit.type !== "Gun")) {continue};
                let unitLeader = TeamArray[unit.teamIDs[0]];
                if (!unitLeader) {
                    log("No Unit Leader for this unit: " + unit.name);
                    log("# of units: " + unit.teamIDs.length);
                    return;
                }
                unit.size = unit.teamIDs.length;
                unitLeader.token.set("bar1_value",0);
                if (unit.pinned() === true) {
                    CheckArray.push(unit);
                };
            };
            if (CheckArray.length > 0) {
                SetupCard("Rally Checks","",nat);
                ButtonInfo("Start Rally Checks","!RallyChecks");
                PrintCard();            
            } else {
                StartPhase("Unit Morale");
            }
        }
        if (pass === "Unit Morale") {
            CheckArray = [];
            let keys = Object.keys(UnitArray);
            for (let i=0;i<keys.length;i++) {
                let unit = UnitArray[keys[i]];
                let unitLeader = TeamArray[unit.teamIDs[0]];
                if (!unitLeader) {
                    log("Error in Unit Morale Unit Leader")
                    log(unit)
                    continue;
                }
                if (unit.player !== state.FOW4.currentPlayer || unitLeader.special.includes("HQ") || unitLeader.special.includes("Independent")) {continue};
                let count = 0;
                let ids = unit.teamIDs;
                for (let j=0;j<ids.length;j++) {
                    let team = TeamArray[ids[j]];
                    if (team.type === "Tank") {
                        if (team.bailed() === true) {
                            continue;
                        }
                    }
                    if (team.inCommand() === true) {
                        count++;
                    }   
                }
                if (count < lastStandCount[unit.type]) {
                    CheckArray.push(unit);
                }
            }
            if (CheckArray.length > 0) {
                SetupCard("Unit Morale Checks","",nat);
                ButtonInfo("Start Morale Checks","!MoraleChecks");
                PrintCard();            
            } else {
                StartPhase("Formation Morale");
            }
        }
        if (pass === "Formation Morale") {      
            let keys = Object.keys(FormationArray);
            for (let i=0;i<keys.length;i++) {
                let formation = FormationArray[keys[i]];
                if (formation.name === "Support") {continue};
                let unitNumbers = formation.unitIDs.length;
                if (unitNumbers < 2) {
                    SetupCard(formation.name,"Morale",formation.nation);
                    outputCard.body.push("The Formation as a whole breaks and flees the field!");
                    outputCard.body.push("Check Victory Conditions");
                    //destroy units/teams
                    PrintCard();
                }
            }
            StartPhase("Final");
        }
        if (pass === "Final") {
            SetupCard("Turn: " + state.FOW4.turn,"Start Phase",nat);
            //SendToRear();
            //ClearSmoke();
            RemoveFoxholes();
            //ResetFlags();
            if (state.FOW4.turn === 1 && state.FOW4.currentPlayer === state.FOW4.startingPlayer) {
                outputCard.body.push("Aircraft cannot Arrive this turn");
                outputCard.body.push("All Teams are treated as having moved in the Shooting Step");
                outputCard.body.push("No Artillery Bombardments this turn");
            } else {
                outputCard.body.push("1 - Reveal Ambushes");
                outputCard.body.push("2 - Roll for Reserves");
                outputCard.body.push("3 - Roll for Strike Aircraft");
            }
            PrintCard();
        }
    }

    const ResLeaders = () => {
        /*
        for (let i=0;i<2;i++) {
            if (LeaderResFlag[i] === false) {continue};
            SetupCard("Commander Survival","",state.TY.nations[i][0]);
            let possibleIDs = LeaderResInfo[i].possibleIDs;
            let count = 0;
            for (let j=0;j<possibleIDs.length;j++) {
                let team = TeamArray[possibleIDs[j]];
                if (team) {
                    team.token.set("status_green",true);
                    count += 1;
                }
            }
            if (count === 0) {continue} //all dead
            
            outputCard.body.push(state.TY.nations[i][0] + " Commander has a chance of Survival");
            outputCard.body.push("Eligible Teams are indicated by a Green dot");
            outputCard.body.push("Select One and Click the Button to Roll a Dice");
            outputCard.body.push("On a roll of 3+ the Commander survives and takes over the selected Team");
            curLeaderPlayer = i;
            ButtonInfo("Commander Survival","!CommanderSurvival");
            PrintCard();
            return;
        }
        */
        StartPhase("Remount");
    }

    const StartInFoxholes = () => {
        let keys = Object.keys(UnitArray);
        for (let i=0;i<keys.length;i++) {
            let unit = UnitArray[keys[i]];
            DigIn(unit);
        }
    }


    const RemountChecks = () => {
        let team = CheckArray.shift();
        if (team) {
            let location = team.location;
            sendPing(location.x,location.y, Campaign().get('playerpageid'), null, true); 
            SetupCard(team.name,"Remount",team.nation);
            outputCard.body.push("Roll Against: " + team.remount);
            ButtonInfo("Roll","!RollD6;Remount;" + team.id + ";" + team.remount);
            PrintCard();
        } else {
            StartPhase("Rally");
        }
    }
    
    const RallyChecks = () => {
        let unit = CheckArray.shift();
        if (unit) {
            SetupCard(unit.name,"Rally",unit.nation);
            let unitLeader = TeamArray[unit.teamIDs[0]];
            let location = unitLeader.location;
            let rally = unitLeader.rally;
            if (unitLeader.nation === "Soviet" && unit.type === "Infantry") {
                if (Komissar(unit) === true) {
                    rally = Math.min(rally,unitLeader.komissar);
                }
            }           
            sendPing(location.x,location.y, Campaign().get('playerpageid'), null, true); 
            outputCard.body.push("Roll Against: " + rally);
            ButtonInfo("Roll","!RollD6;Rally;" + unit.id + ";" + rally);
            PrintCard();
        } else {
            StartPhase("Unit Morale");
         }
    }
    
    const MoraleChecks = () => {
        let unit = CheckArray.shift();
        if (unit) {
            SetupCard(unit.name,"Unit Morale",unit.nation);
            let unitLeader = TeamArray[unit.teamIDs[0]];
            let location = unitLeader.location;
            let lastStand = unitLeader.laststand;
            if (unitLeader.nation === "Soviet" && unit.type === "Infantry") {
                if (Komissar(unit) === true) {
                    lastStand = Math.min(lastStand,unitLeader.komissar);
                }
            }
            sendPing(location.x,location.y, Campaign().get('playerpageid'), null, true); 
            outputCard.body.push("Roll Against: " + lastStand);
            ButtonInfo("Roll","!RollD6;UnitMorale;" + unit.id + ";" + lastStand);
            PrintCard();
        } else {
            StartPhase("Formation Morale");
        }
    }
    
    const RollD6 = (msg) => {
        let Tag = msg.content.split(";");
        PlaySound("Dice");
        let roll = randomInteger(6);
        if (Tag.length === 1) {
            let playerID = msg.playerid;
            let nation = "Neutral";
            if (!state.FOW4.players[playerID] || state.FOW4.players[playerID] === undefined) {
                if (msg.selected) {
                    let id = msg.selected[0]._id;
                    if (id) {
                        let tok = findObjs({_type:"graphic", id: id})[0];
                        let char = getObj("character", tok.get("represents")); 
                        nation = Attribute(char,"nation");
                        state.FOW4.players[playerID] = nation;
                    }
                } else {
                    sendChat("","Click on one of your tokens then select Roll again");
                    return;
                }
            } else {
                nation = state.FOW4.players[playerID];
            }
            let res = "/direct " + DisplayDice(roll,nation,40);
            sendChat("player|" + playerID,res);
        } else {
            let type = Tag[1];
            if (type === "Remount") {
                let id = Tag[2];
                let needed = parseInt(Tag[3]);
                let team = TeamArray[id];
                let unit = UnitArray[team.unitID];
                let roll = randomInteger(6);
                let reroll = CommandReroll(team);
                SetupCard(team.name,"Needing: " + needed + "+",team.nation);
                outputCard.body.push("Team: " + DisplayDice(roll,team.nation,24));
                if (roll < needed && reroll > -1) {
                    outputCard.body.push("Commander Reroll: " + DisplayDice(reroll,team.nation,24));
                }
                if (roll >= needed || reroll >= needed) {
                    outputCard.body.push("Success!");
                    let colour = "transparent";
                    if (id === unit.teamIDs[0]) {
                        colour = Colours.green;
                    }
                    team.token.set("aura1_color",colour);
                } else {
                    outputCard.body.push("Failure! Team remains Bailed Out");
                }
                let part1 = "Done";
                if (CheckArray.length > 0) {
                    part1 = "Next Team";
                } 
                ButtonInfo(part1,"!RemountChecks");
                PrintCard();
            } else if (type === "Rally") {
                let unitID = Tag[2];
                let needed = parseInt(Tag[3]);
                let unit = UnitArray[unitID];
                let roll = randomInteger(6);
                let unitLeader = TeamArray[unit.teamIDs[0]];
                SetupCard(unit.name,"Needing: " + needed + "+",unit.nation);
                outputCard.body.push("Unit Leader: " + DisplayDice(roll,unit.nation,24));
                let reroll = CommandReroll(unitLeader);
                if (roll < needed && reroll > -1) {
                    outputCard.body.push("Commander Reroll: " + DisplayDice(reroll,unit.nation,24));
                }
                if (roll >= needed || reroll >= needed) {
                    outputCard.body.push("Success!");
                    unit.unpin();
                } else {
                    outputCard.body.push("Failure! Unit remains Pinned");
                }
                let part1 = "Done";
                if (CheckArray.length > 0) {
                    part1 = "Next Unit";
                } 
                ButtonInfo(part1,"!RallyChecks");
                PrintCard();
            } else if (type === "UnitMorale") {
                let unitID = Tag[2];
                let needed = parseInt(Tag[3]);
                let unit = UnitArray[unitID];
                let roll = randomInteger(6);
                let unitLeader = TeamArray[unit.teamIDs[0]];
                if (!unitLeader) {
                    log("ERROR with Unit Leader of unit: " + unit.name)
                    return;
                }
                SetupCard(unit.name,"Needing: " + needed + "+",unit.nation);
                outputCard.body.push("Unit Leader: " + DisplayDice(roll,unit.nation,24));
                let reroll = CommandReroll(unitLeader);
                if (roll < needed && reroll > -1) {
                    outputCard.body.push("Commander Reroll: " + DisplayDice(reroll,unit.nation,24));
                }
                if (roll >= needed || reroll >= needed) {
                    outputCard.body.push("Success!");
                    outputCard.body.push("Unit continues to fight.");
                } else {
                    outputCard.body.push("Failure! Unit Flees the Field!");
                    outputCard.body.push("(Any associated Transports Should be Removed)");
                    FormationArray[unit.formationID].remove(unit);
                    for (let i=0;i<unit.teamIDs;i++) {
                        let id = unit.teamIDs[i];
                        TeamArray[id].Kill();
                    }
                }
                let part1 = "Done";
                if (CheckArray.length > 0) {
                    part1 = "Next Unit";
                } 
                ButtonInfo(part1,"!MoraleChecks");
                PrintCard();
            } else if (type === "CounterAttack") {
                let unitID = Tag[2];
                let needed = parseInt(Tag[3]);
                let unit = UnitArray[unitID];
                let roll = randomInteger(6);
                let unitLeader = TeamArray[unit.teamIDs[0]];
                if (!unitLeader) {
                    log("ERROR with Unit Leader of unit: " + unit.name)
                    return;
                }
                SetupCard(unit.name,"Needing: " + needed + "+",unit.nation);
                outputCard.body.push("Unit Leader: " + DisplayDice(roll,unit.nation,24));
                let reroll = CommandReroll(unitLeader);
                if (roll < needed && reroll > -1) {
                    outputCard.body.push("Commander Reroll: " + DisplayDice(reroll,unit.nation,24));
                }
                if (roll >= needed || reroll >= needed) {
                    outputCard.body.push("Success!");
                    outputCard.body.push("Unit can Counter Attack!");
                    outputCard.body.push("Alternately the Unit can Break Off");
                    outputCard.body.push('Units that Break Off must move to at least 6" away and are pinned');
                    ButtonInfo("Counter Attack!","!CounterAttack2;" + unitID + ";CA");
                    ButtonInfo("Break Off!","!CounterAttack2;" + unitID + ";BO");
                    PrintCard();
                } else {
                    outputCard.body.push("Failure! Unit must Break Off");
                    outputCard.body.push("Any remaining Teams in the Unit(s) must now Break Off at Tactical Speed");
                    outputCard.body.push('Any Teams not able to get 6" away from an Assaulting Team surrender and are Destroyed');
                    if (unitLeader.type === "Infantry") {
                        outputCard.body.push("Unit is also Pinned");
                        unit.pin();
                    }
                    unit.order = "Break Off";
                    let part1 = "Done";
                    if (CheckArray.length > 0) {
                        part1 = "Next Unit";
                    } 
                    ButtonInfo(part1,"!CounterAttack");
                    PrintCard();  
                }           
            }
        }
    }

    const CommandReroll = (team) => {
        //will be unitLeader if pinning, counterattack
        //else will be an individual tank team if remounting
        let reroll = -1;
        let formation = FormationArray[team.formationID];
        let formationLeaders = [];
        if (formation.name !== "Support") {
            for (let i=0;i<formation.unitIDs.length;i++) {
                let unit = UnitArray[formation.unitIDs[i]];
                if (unit.hqUnit === true) {
                    let leader = TeamArray[unit.teamIDs[0]];
                    formationLeaders.push(leader);
                }
            }
        } else {
            let keys = Object.keys(UnitArray);
            for (let i=0;i<keys.length;i++) {
                let unit = UnitArray[formation.unitIDs[i]];
                if (unit.hqUnit === true && unit.player === team.player) {
                    let leader = TeamArray[unit.teamIDs[0]];
                    formationLeaders.push(leader);
                }
            }
        }
        for (let i=0;i<formationLeaders.length;i++) {
            let leader = formationLeaders[i];
            let checkID = leader.id;
            /*
            if (leader.token.get(SM.mounted) === true) {
                checkID = leader.transport;
            }
            */
            let losCheck = LOS(team.id,checkID);
            if (losCheck.los === true && losCheck.distance <= 6) {
                reroll = randomInteger(6);
                break;
            }
        }
        return reroll;
    }

    const Komissar = (unit) => {
        let komCheck = false;
        //returns true if unit has a Komissar who is in command
        let leader = TeamArray[unit.teamIDs[0]];
        for (let i=0;i<unit.teamIDs.length;i++) {
            let team = TeamArray[unit.teamIDs[i]];
            if (team.special.includes("Komissar") && team.inCommand() === true) {
                komCheck = true;
            }
        }
        return komCheck;
    }

    const Shooting = (msg) => {
        let Tag = msg.content.split(";");
        let shooterID = Tag[1];
        let targetID = Tag[2];
        let weaponType = Tag[3]; 
        let shellType = Tag[4]; //Regular,Smoke
        let shooter = TeamArray[shooterID];
        let shooterUnit = UnitArray[shooter.unitID];
        let unitFire = false;

        let sname = shooter.name;
        if (shooterID === shooterUnit.teamIDs[0]) {
            unitFire = true
            sname = shooterUnit.name;
        };
        let weapons = [];
        let shooterTeamArray = [];
        let target = TeamArray[targetID];
        let targetTeamArray = BuildTargetTeamArray(target,shooter);
//safety distance for aircraft to be added in for target and mates

        let mistaken = true;
        if (shooter.hex.distance(target.hex) < 8 && target.type === "Tank" && shooter.hex.distance(target.hex) < 4) {
            mistaken = false;
        }
log("Mistaken: " + mistaken)
        SetupCard(sname,"Shooting",shooter.nation);

        for (let i=0;i<shooterUnit.teamIDs.length;i++) {
            let st = TeamArray[shooterUnit.teamIDs[i]];
            if (unitFire === false && shooterID !== st.id) {continue}; //single team firing
            if (st.inCommand() === false && unitFire === true) {continue};
            if (st.token.get(SM.fired) === true || st.token.get(SM.aafire) === true) {continue}; //fired already
            if (st.token.get(SM.dash) === true) {continue}; //dashed or clear minefield
            if (st.token.get(SM.radio) === true) {continue}; //called artillery
            if (st.type === "Tank") {
                if (st.bailed() === true) {continue}; //bailed out
            }

            for (let j=0;j<st.weaponArray.length;j++) {
                let weapon = st.weaponArray[j];
                let overhead = "";
                if (weaponType === "MG" && weapon.type.includes("MG") === false) {
                    continue;
                } else if (weaponType !== "MG" && weapon.type !== weaponType) {
                    continue;
                };
                if (weapon.notes.includes("Overhead")) {overhead = "Overhead"}
                let initialLOS = LOS(st.id,targetID,overhead);
                if (initialLOS.los === false) {continue};
                if (weapon.minRange > initialLOS.distance || weapon.maxRange < initialLOS.distance) {continue};
                if (weapon.notes.includes("Forward Firing") && initialLOS.shooterface !== "Front") {continue};
                weapons.push(weapon);
                let eta = {
                    targetName: target.name,
                    targetID: targetID,
                    los: initialLOS,
                    rangeFromInitial: 0,
                }
                st.eta = [eta];
                shooterTeamArray.push(st);
                if (weapon.type !== "AA MG") {
                    //RotateToken(st,target,90);
                }
            }
        }

        shooterTeamArray = [...new Set(shooterTeamArray)];

        if (shooterTeamArray.length === 0) {
            outputCard.body.push("Target not in Range or LOS");
            PrintCard();
            return;
        }

        weapons = Unique(weapons,"name");

        //expand ETA
        for (let i=0;i<shooterTeamArray.length;i++) {
            let st = shooterTeamArray[i];
            for (let j=0;j<targetTeamArray.length;j++) {
                let tt = TeamArray[targetTeamArray[j].id];
                if (tt.id === targetID) {continue} //already in ETA
                let weaponFlag = false;
                let ttLOS;
                for (let k=0;k<weapons.length;k++) {
                    let weapon = weapons[k];
                    let overhead = "";
                    if (weapon.notes.includes("Overhead")) {overhead = "Overhead"}
                    ttLOS = LOS(st.id,tt.id,overhead);
                    if (ttLOS.los === false) {continue};
                    if (ttLOS.distance > weapon.maxRange) {continue};
                    if (ttLOS.distance < weapon.minRange) {continue};
                    if (weapon.notes.includes("Forward Firing") && ttLOS.shooterface !== "Front") {continue};
                    weaponFlag = true;
                    break; //has one weapon with range and in arc
                }
                if (weaponFlag === false) {continue};
                let rfi = tt.hex.distance(target.hex);
                let eta = {
                    targetName: tt.name,
                    targetID: tt.id,
                    los: ttLOS,
                    rangeFromInitial: rfi,
                }
                st.eta.push(eta);
            }

            //reorder the eta based on distance from initial target
            st.eta = st.eta.sort(function(a,b) {
                return a.rangeFromInitial - b.rangeFromInitial;
            });
            log(st.name)
            log(st.eta)
        }
log("# Shooters: " + shooterTeamArray.length)

log(weapons)
        
        for (let i=0;i<shooterTeamArray.length;i++) {
            let sTeam = shooterTeamArray[i];
            let eta = sTeam.eta;
            for (let j=0;j<weapons.length;j++) {
                let weapon = weapons[j];
                let toHit = target.hit;
                let los = eta[0].los;
                if (los.distance > Math.max(16,Math.round(weapon.maxRange/2))) {
                    toHit++;
                }
                if (los.concealed === true) {
                    toHit++;
                    if (target.token.get(SM.gtg) === true) {
                        toHit++;
                    }
                }
                if (los.smoke === true) {
                    toHit++;
                }
                if (sTeam.inCommand() === false) {
                    toHit++;
                }
                if (state.FOW4.darkness === true) {
                    toHit++;
                }

                let rof = weapon.halted;
                if (sTeam.token.get(SM.tactical) === true) {
                    rof = weapon.moving;
                }

                let rolls = [];
                let hits = 0;
                for (let k=0;k<rof;k++) {
                    let roll = randomInteger(6);
                    let roll2 = randomInteger(6);
                    if (roll >= toHit) {
                        rolls.push(roll);
                        hits++;
                    } else if (toHit > 6 && toHit < 9 && roll === 6) {
                        rolls.push(roll + "/" + roll2);
                        if (toHit === 7 && roll2 > 4) {
                            hits++;
                        } else if (toHit === 8 && roll2 === 6) {
                            hits++;
                        }
                    } else {
                        rolls.push(roll);
                    }
                }

log("To Hit: " + toHit)
log("Rolls: " + rolls)
                outputCard.body.push(sTeam.name + " firing " + weapon.name + " gets " + hits + " hits.");
                //assign hits
                for (let q=0;q<hits;q++) {
    log("Hit " + (q+1))
                    let targNum = 0
                    for (let t=0;t<(eta.length - 1);t++) {
                        let t1 = TeamArray[eta[t].targetID];
                        let num1 = t1.hitArray.length;
                        let t2 = TeamArray[eta[t+1].targetID];
                        let num2 = t2.hitArray.length;
    log("Target " + t + ": " + t1.name + " Hits: " + num1);
    log("Target " + (t+1) + ": " + t2.name + " Hits: " + num2);
                        if (num2 < num1) {
                            targNum = (t+1);
                            break;
                        }
                    }
    log("Assigned to " + TeamArray[eta[targNum].targetID].name);
                    let hit = {
                        weapon: weapon,
                        bp: eta[targNum].los.bulletproof,
                        facing: eta[targNum].los.facing,
                        distance: eta[targNum].los.distance,
                        shooterID: sTeam.id,
                        special: eta[targNum].los.special,
                    }
                    TeamArray[eta[targNum].targetID].hitArray.push(hit);
                }
            }
        }

        if (targetTeamArray.length > 1 && mistaken === true) {
            Mistaken(targetTeamArray,shooterTeamArray);
        }
log("Final Hit #s")
        for (let i=0;i<targetTeamArray.length;i++) {
            let tt = TeamArray[targetTeamArray[i].id];
log(tt.name + " - Hits: " + tt.hitArray.length)
            if (unitIDs4Saves.includes(tt.unitID) === false) {
                unitIDs4Saves.push(tt.unitID);
            }
        }





        

        //Saves ?



        PrintCard();


    }

    const CompareHits = (ta1,ta2) => {
        let hitInfo = {
            hits1: {
                swappable: [],
                unswappable: [],
            },
            hits2: {
                swappable: [],
                unswappable: [],
            }
        }
        for (let i=0;i<TeamArray[ta1.id].hitArray.length;i++) {
            let hit = TeamArray[ta1.id].hitArray[i];
            if (ta2.shooterIDs.includes(hit.shooterID)) {
                let newLOS = LOS(hit.shooterID,ta2.id,hit.special);
                hit.bp = newLOS.bp;
                hit.facing = newLOS.facing;
                hit.distance = newLOS.distance;
                hitInfo.hits1.swappable.push(hit);
            } else {
                hitInfo.hits1.unswappable.push(hit);
            }
        }
        for (let i=0;i<TeamArray[ta2.id].hitArray.length;i++) {
            let hit = TeamArray[ta2.id].hitArray[i];
            if (ta1.shooterIDs.includes(hit.shooterID)) {
                let newLOS = LOS(hit.shooterID,ta1.id,hit.special);
                hit.bp = newLOS.bp;
                hit.facing = newLOS.facing;
                hit.distance = newLOS.distance;
                hitInfo.hits2.swappable.push(hit);
            } else {
                hitInfo.hits2.unswappable.push(hit);
            }
        }
        return hitInfo;
    }











    const BuildTargetTeamArray = (targetTeam,shooterTeam) => {
        let array = [];
        let shooterUnit = UnitArray[shooterTeam.unitID];
        let targetUnit = UnitArray[targetTeam.unitID];
        let ids = targetUnit.teamIDs;

        //if HQ or independent, can add nearby formation in
        if (targetTeam.special.includes("HQ") || targetTeam.special.includes("Independent")) {
            let keys = Object.keys(UnitArray);
            btaLoop1:
            for (let j=0;j<keys.length;j++) {
                let unit = UnitArray[keys[j]];
                if (unit.id === targetUnit.id || unit.player !== targetUnit.player || unit.type !== targetUnit.type) {continue};
                for (let k=0;k<unit.teamIDs.length;k++) {
                    let team3 = TeamArray[unit.teamIDs[k]];
                    if (team3.hex.distance(targetTeam.hex) <= commandRadius[0]) {
                        //a valid team - add its unit IDs, rest will get sorted in/out below
                        ids = ids.concat(unit.teamIDs);
                        break btaLoop1;
                    }
                }
            }
        }

        for (let i=0;i<ids.length;i++) {
            let team = TeamArray[ids[i]];
            let priority = 0;
            if (i === 0) {priority = 1};
            let refDistance = targetTeam.hex.distance(team.hex);//distance from targeted team to this team
            if (refDistance > 6 || team.type !== targetTeam.type) {continue}; //too far or not same type
            if (team.special.includes("HQ") || team.special.includes("Independent")) {priority = 3};
            if (team.unique === true) {priority = 2};
            if (team.bailed() === true && team.type === "Tank") {priority = -2};

            let shooterIDs = []; //used for Mistaken Swaps
            for (let j=0;j<shooterUnit.teamIDs.length;j++) {
                let ttLOS = LOS(team.id,shooterUnit.teamIDs[j],"Overhead");
                if (ttLOS.los === true) {
                    shooterIDs.push(shooterUnit.teamIDs[j]);
                }
            }

            let info = {
                name: team.name,
                id: team.id,
                priority: priority,
                refDistance: refDistance,
                shooterIDs: shooterIDs,
            }
            array.push(info);
        }

        array = array.sort(function(a,b) {
            return a.refDistance - b.refDistance; //order based on distance from initial target
        });

    log("Target Array")
    log(array)
        return array;
    }




    const Mistaken = (targetTeamArray,shooterTeamArray) => {
log("In Mistaken")
        //applies mistaken target rule to targets 
        let roll = randomInteger(6);
log("Roll: " + roll)
        let array = targetTeamArray.sort(function(a,b){
            return b.priority - a.priority;
        })
log(array)
        for (let i=0;i<array.length;i++) {
            if (roll < 3) {break};
            let t1 = array[i];
log("T1: " + t1.name + " / Priority: " + t1.priority)
            for (let j=(array.length - 1);j>i;j--) {
                let t2 = array[j];
log("T2: " + t2.name + " / Priority: " + t2.priority)
                if (t1.priority === t2.priority) {continue};
                let hitInfo = CompareHits(t1,t2); //eligible hits for swapping
log("Hit Info")
log(hitInfo)
                if (hitInfo.hits2.swappable.length < hitInfo.hits1.swappable.length) {
log("A Swap Occurs")
                    let h1 = hitInfo.hits1.unswappable.concat(hitInfo.hits2.swappable);
                    let h2 = hitInfo.hits2.unswappable.concat(hitInfo.hits1.swappable);
log("Team1 New Hits: " + h1.length);
log("Team2 New Hits: " + h2.length);
                    TeamArray[t1.id].hitArray = h1;
                    TeamArray[t2.id].hitArray = h2;
                    roll = randomInteger(6);
log("Roll: " + roll)
                    break;
                }
            }
        }
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
            case '!Cross':
                Cross(msg);
                break;
            case '!NewTurn':
                NewTurn();
                break;
            case '!RemountChecks':
                RemountChecks();
                break;
            case '!RallyChecks':
                RallyChecks();
                break;
            case '!MoraleChecks':
                MoraleChecks();
                break;
            case '!RollD6':
                RollD6(msg);
                break;        
            case '!Shooting':
                Shooting(msg);
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