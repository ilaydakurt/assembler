const fs = require( "fs" );
const path = require( 'path' );
const { parse } = require("path/posix");

function add(val1, val2){
    let c = 0
    newVal = ''
    for (let i=val1.length-1;i>=0;i--){
       
        newVal = ((Number(val1[i]) + Number(val2[i]) + c) % 2).toString() + newVal
        c = ((Number(val1[i]) + Number(val2[i]) + c) - (Number(val1[i]) + Number(val2[i]) + c) %2) / 2
    }
    // console.log(newVal)
    return newVal
}
function carry(val1, val2){
    c = 0
    newVal = ''
    for (let i =val1.length-1;i>=0;i--){
        newVal = ((Number(val1[i]) + Number(val2[i]) + c) % 2).toString() + newVal
        c = ((Number(val1[i]) + Number(val2[i]) + c) - (Number(val1[i]) + Number(val2[i]) + c)%2)/2
    }
    if(c == 1){
        return true
    }
    else{
        return false
    }
}
function complement(val){
    newVal =''
    for (i=0;i<16;i++){ 
        if (val[i] == '0'){
            newVal += '1'
        }
        else{
            newVal += '0'
        }
    }
    return newVal
}

function cpu514exec ()
{
    let fileNameToRead = process.argv.slice( 2 )[ 0 ]
    let fileNameToWrite = fileNameToRead.split(".bin")[0] + ".txt"

    let registerValueDictionary = {"A": "0000000000000000", "B": "0000000000000000",
                           "C": "0000000000000000", "D": "0000000000000000",
                           "E": "0000000000000000", "S": "1111111111111111", "PC": "0000000000000000"}
    let registerDictionary = {"1": "A", "2": "B", "3": "C", "4": "D", "5": "E", "6": "S", "0": "PC"}
    let flagDictionary = {'ZF': 0, 'CF': 0, 'SF': 0}
    let stackInitial = ["0000000000000000"]
    let stack=[]
    for (let i=0;i<65536;i++){
        stack=stack.concat(stackInitial)
    }
    // console.log(stack.length)
    let opcode
    let addMode
    let operand
    let i =0
    fs.readFile( path.join( __dirname, fileNameToRead ), 'utf-8', ( err, data ) =>
    {
        let text = data.split( "\n" )
        for ( line of text ){
            line = line.trim()
            binary = parseInt(line,16).toString(2).padStart(24,"0")
            opcode = parseInt(binary.slice(0,6),2).toString(16)
            addMode = binary.slice(6,8)
            operand = parseInt(binary.slice(8,),2).toString(16)
            // console.log(opcode,addMode,operand)
            stack[i] = opcode
            stack[i+1] = addMode
            stack[i+2] = operand
            i += 3
        }
        while(true){
        opcode = stack[parseInt(registerValueDictionary["PC"], 2)]
        addMode = stack[parseInt(registerValueDictionary["PC"], 2) + 1]
        operand = stack[parseInt(registerValueDictionary["PC"], 2) + 2]
        // console.log(opcode,addMode,operand)
        if(opcode == "1"){
            // console.log("BREAAK")
            break;
        }
        else if (opcode == "2"){
            // console.log("İKİ", opcode,addMode,operand)
            // console.log(registerValueDictionary["PC"])
            registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            if (addMode == "00"){
                let value = parseInt(operand,16).toString(2).padStart(16,"0")
                registerValueDictionary["A"] =`${value}`
            }
            else if (addMode == "01"){
            registerValueDictionary["A"] = registerValueDictionary[registerDictionary[operand]]
            }
            else if (addMode == '10'){
            registerValueDictionary["A"] = stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)]
            }
            else if (addMode == '11'){
                registerValueDictionary["A"] = stack[int(operand, 16)]
            }
        }
        else if (opcode == "3"){
            // console.log("ÜÇ", opcode,addMode,operand)

            registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            if (addMode == "01"){
                registerValueDictionary[registerDictionary[operand]] = registerValueDictionary["A"]
            }
            else if (addMode == '10'){
                stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)] = registerValueDictionary["A"]
            }
            else if (addMode == '11'){
                stack[parseInt(operand, 16)] = registerValueDictionary["A"]
            }
        }
        else if (opcode == "4"){
            // console.log("DÖRT", opcode,addMode,operand)
            registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            flagDictionary['SF'] = 0  
            if (addMode == "00"){
                let value = parseInt(operand,16).toString(2).padStart(16,"0")
                c = carry(registerValueDictionary["A"], `${value}`)
                registerValueDictionary["A"] = add(registerValueDictionary["A"], `${value}`)
                if (c){
                    flagDictionary['CF'] = 1
                }
                else{
                    flagDictionary['CF'] = 0
                }
            }
            else if (addMode == "01"){
                c = carry(registerValueDictionary["A"], registerValueDictionary[registerDictionary[operand]])
                registerValueDictionary["A"] = add(registerValueDictionary["A"], registerValueDictionary[registerDictionary[operand]])
                if (c){
                    flagDictionary['CF'] = 1
                }
                else{
                    flagDictionary['CF'] = 0
                }
            }
            else if (addMode == '10'){
                c = carry(registerValueDictionary["A"],  stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)])
                registerValueDictionary["A"] = add(registerValueDictionary["A"],  stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)])
                if (c){
                    flagDictionary['CF'] = 1
                }
                else{
                    flagDictionary['CF'] = 0
                }
            }
            else if (addMode == '11'){
                c = carry(registerValueDictionary["A"], stack[int(operand, 16)])
                registerValueDictionary["A"] = add(registerValueDictionary["A"], stack[int(operand, 16)])
                if (c){
                    flagDictionary['CF'] = 1
                }
                else{
                    flagDictionary['CF'] = 0
                }
            }
            if (registerValueDictionary["A"] == "0".padStart(16,"0")){
                flagDictionary["ZF"] = 1
            }
            else{
                flagDictionary["ZF"] = 0
            }
            if (registerValueDictionary["A"][0] == '1'){
                flagDictionary["SF"] = 1
            }
            else{
                flagDictionary["SF"] = 0
            }
        }
        else if (opcode == "5"){
            // console.log("BEŞ", opcode,addMode,operand)

            registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            if (addMode == "00"){
                let value = parseInt(operand,16).toString(2).padStart(16,"0")
                c = carry(registerValueDictionary['A'], add(complement(`${value}`),  "1".padStart(16,"0")))
                registerValueDictionary['A'] = add(registerValueDictionary['A'], add(complement(`${value}`),  "1".padStart(16,"0")))
                if (c){
                    flagDictionary['CF'] = 1
                }
                else{
                    flagDictionary['CF'] = 0
                }
            }
            else if (addMode == "01"){
                c = carry(registerValueDictionary['A'], add(complement(registerValueDictionary[registerDictionary[operand]]), "1".padStart(16,"0")))
                registerValueDictionary['A'] = add(registerValueDictionary['A'], add(complement(registerValueDictionary[registerDictionary[operand]]), "1".padStart(16,"0")))
                if (c){
                    flagDictionary['CF'] = 1
                }
                else{
                    flagDictionary['CF'] = 0
                }
            }
            else if (addMode == "10"){
                c = carry(registerValueDictionary["A"],  add(complement(stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)]), "1".padStart(16,"0")))
                registerValueDictionary["A"] = add(registerValueDictionary["A"],  add(complement(stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)]), "1".padStart(16,"0")))
                if (c){
                    flagDictionary['CF'] = 1
                }
                else{
                    flagDictionary['CF'] = 0
                }
            }
            else if (addMode == "11"){
                c = carry(registerValueDictionary["A"], add(complement(stack[parseInt(operand, 16)]), "1".padStart(16,"0")))
                registerValueDictionary["A"] = add(registerValueDictionary["A"], add(complement(stack[parseInt(operand, 16)]), "1".padStart(16,"0")))
                if (c){
                    flagDictionary['CF'] = 1
                }
                else{
                    flagDictionary['CF'] = 0
                }
            }
            if (registerValueDictionary["A"] == "0".padStart(16,"0")){
                flagDictionary["ZF"] = 1
            }
            else{
                flagDictionary["ZF"] = 0
            }
            if (registerValueDictionary["A"][0] == '1'){
                flagDictionary["SF"] = 1
            }
            else{
                flagDictionary["SF"] = 0
            } 
        }
        else if (opcode == "6"){
            // console.log("ALTI", opcode,addMode,operand)

            registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            if (addMode == "01"){
                c = carry(registerValueDictionary[registerDictionary[operand]], "1".padStart(16,"0"))
                // console.log(c)
                registerValueDictionary[registerDictionary[operand]] = add(registerValueDictionary[registerDictionary[operand]], "1".padStart(16,"0"))
                // console.log(registerValueDictionary[registerDictionary[operand]])
                if (registerValueDictionary[registerDictionary[operand]] == "0".padStart(16,"0")){
                    flagDictionary["ZF"] = 1
                }
                else{
                    flagDictionary["ZF"] = 0
                }
                if (registerValueDictionary[registerDictionary[operand]][0] == '1'){
                    flagDictionary["SF"] = 1
                }
                else{
                    flagDictionary["SF"] = 0
                }
                if (c){
                    flagDictionary['CF'] = 1
                }
                else{
                    flagDictionary['CF'] = 0
                } 
            }
            else if (addMode == "10"){
                c = carry(stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)], "1".padStart(16,"0"))
                stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)] = add(stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)], "1".padStart(16,"0"))
                if (stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)] == "0".padStart(16,"0")){
                    flagDictionary["ZF"] = 1
                }
                else{
                    flagDictionary["ZF"] = 0
                }
                if (stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)][0] == '1'){
                    flagDictionary["SF"] = 1
                }
                else{
                    flagDictionary["SF"] = 0
                }
                if (c){
                    flagDictionary['CF'] = 1
                }
                else{
                    flagDictionary['CF'] = 0
                } 
            }
            else if (addMode == "11"){
                c = carry(stack[parseInt(operand, 16)], "1".padStart(16,"0"))
                stack[parseInt(operand, 16)] = add(stack[parseInt(operand, 16)], "1".padStart(16,"0"))
                if (stack[parseInt(operand, 16)]  == "0".padStart(16,"0")){
                    flagDictionary["ZF"] = 1
                }
                else{
                    flagDictionary["ZF"] = 0
                }
                if (stack[parseInt(operand, 16)] [0] == '1'){
                    flagDictionary["SF"] = 1
                }
                else{
                    flagDictionary["SF"] = 0
                }
                if (c){
                    flagDictionary['CF'] = 1
                }
                else{
                    flagDictionary['CF'] = 0
                } 
            }
        }
        else if (opcode == "7"){
            // console.log("YEDİ", opcode,addMode,operand)

            registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            if (addMode == "01"){
                c = carry(registerValueDictionary[registerDictionary[operand]], add(complement("1".padStart(16,"0")), "1".padStart(16,"0")))
                registerValueDictionary[registerDictionary[operand]] = add(registerValueDictionary[registerDictionary[operand]],  add(complement("1".padStart(16,"0")), "1".padStart(16,"0")))
                if (registerValueDictionary[registerDictionary[operand]] == "0".padStart(16,"0")){
                    flagDictionary["ZF"] = 1
                }
                else{
                    flagDictionary["ZF"] = 0
                }
                if (registerValueDictionary[registerDictionary[operand]][0]== '1'){
                    flagDictionary["SF"] = 1
                }
                else{
                    flagDictionary["SF"] = 0
                }
                if (c){
                    flagDictionary['CF'] = 1
                }
                else{
                    flagDictionary['CF'] = 0
                } 
            }
            else if (addMode == "10"){
                c = carry(stack[int(registerValueDictionary[registerDictionary[operand]], 2)], add(complement("1".padStart(16,"0")), "1".padStart(16,"0")))
                stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)] = add(stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)], add(complement("1".padStart(16,"0")), "1".padStart(16,"0")))
                if (stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)] == "0".padStart(16,"0")){
                    flagDictionary["ZF"] = 1
                }
                else{
                    flagDictionary["ZF"] = 0
                }
                if (stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)][0] == '1'){
                    flagDictionary["SF"] = 1
                }
                else{
                    flagDictionary["SF"] = 0
                }
                if (c){
                    flagDictionary['CF'] = 1
                }
                else{
                    flagDictionary['CF'] = 0
                } 
            }
            else if (addMode == "11"){
                c = carry(stack[parseInt(operand, 16)],  add(complement("1".padStart(16,"0")), "1".padStart(16,"0")))
                stack[parseInt(operand, 16)] = add(stack[parseInt(operand, 16)],  add(complement("1".padStart(16,"0")), "1".padStart(16,"0")))
                if (stack[parseInt(operand, 16)] == "0".padStart(16,"0")){
                    flagDictionary["ZF"] = 1
                }
                else{
                    flagDictionary["ZF"] = 0
                }
                if (stack[parseInt(operand, 16)][0] == '1'){
                    flagDictionary["SF"] = 1
                }
                else{
                    flagDictionary["SF"] = 0
                }
                if (c){
                    flagDictionary['CF'] = 1
                }
                else{
                    flagDictionary['CF'] = 0
                } 
            }
        }
        else if (opcode == "8"){
            // console.log("SEKİZ", opcode,addMode,operand)

            registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            if (addMode == "00"){
                let value = (parseInt(registerValueDictionary["A"], 2) ^ parseInt(operand, 16)).toString(2)
                // console.log(value)
                registerValueDictionary["A"] = `${value}`
            }
            else if (addMode == "01"){
                let value = (parseInt(registerValueDictionary["A"], 2) ^ parseInt(registerValueDictionary[registerDictionary[operand]] ,2)).toString(2)
                // console.log(value)

                registerValueDictionary["A"] = `${value}`
            }
            else if (addMode == "10"){
                let value = (parseInt(registerValueDictionary["A"], 2) ^ parseInt(stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)], 2)).toString(2)
                // console.log(value)

                registerValueDictionary["A"] = `${value}`
            }
            else if (addMode == "11"){
                let value = (parseInt(registerValueDictionary["A"], 2) ^ parseInt(stack[parseInt(operand, 16)], 2)).toString(2)
                // console.log(value)
                registerValueDictionary["A"] = `${value}`            
            }
            if (registerValueDictionary["A"]  == "0".padStart(16,"0")){
                flagDictionary["ZF"] = 1
            }
            else{
                flagDictionary["ZF"] = 0
            }
            if (registerValueDictionary["A"][0] == '1'){
                flagDictionary["SF"] = 1
            }
            else{
                flagDictionary["SF"] = 0
            }
        }
        else if (opcode == "9"){
            // console.log("DOKUZ", opcode,addMode,operand)

            registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            if (addMode == "00"){
                let value = (parseInt(registerValueDictionary["A"], 2) & parseInt(operand, 16)).toString(2)
                // console.log(value)
                registerValueDictionary["A"] = `${value}`
            }
            else if (addMode == "01"){
                let value = (parseInt(registerValueDictionary["A"], 2) & parseInt(registerValueDictionary[registerDictionary[operand]] ,2)).toString(2)
                // console.log(value)

                registerValueDictionary["A"] = `${value}`
            }
            else if (addMode == "10"){
                let value = (parseInt(registerValueDictionary["A"], 2) & parseInt(stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)], 2)).toString(2)
                // console.log(value)

                registerValueDictionary["A"] = `${value}`
            }
            else if (addMode == "11"){
                let value = (parseInt(registerValueDictionary["A"], 2) & parseInt(stack[parseInt(operand, 16)], 2)).toString(2)
                // console.log(value)
                registerValueDictionary["A"] = `${value}`            
            }
            if (registerValueDictionary["A"]  == "0".padStart(16,"0")){
                flagDictionary["ZF"] = 1
            }
            else{
                flagDictionary["ZF"] = 0
            }
            if (registerValueDictionary["A"][0] == '1'){
                flagDictionary["SF"] = 1
            }
            else{
                flagDictionary["SF"] = 0
            }
        }
        else if (opcode == "a"){
            // console.log("A", opcode,addMode,operand)

            registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            if (addMode == "00"){
                let value = (parseInt(registerValueDictionary["A"], 2) | parseInt(operand, 16)).toString(2)
                // console.log(value)
                registerValueDictionary["A"] = `${value}`
            }
            else if (addMode == "01"){
                let value = (parseInt(registerValueDictionary["A"], 2) | parseInt(stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)], 2)).toString(2)
                // console.log(value)

                registerValueDictionary["A"] = `${value}`
            }
            else if (addMode == "10"){
                let value = (parseInt(registerValueDictionary["A"], 2) ^ parseInt(stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)], 2)).toString(2)
                // console.log(value)

                registerValueDictionary["A"] = `${value}`
            }
            else if (addMode == "11"){
                let value = (parseInt(registerValueDictionary["A"], 2) | parseInt(stack[parseInt(operand, 16)], 2)).toString(2)
                // console.log(value)
                registerValueDictionary["A"] = `${value}`            
            }
            if (registerValueDictionary["A"]  == "0".padStart(16,"0")){
                flagDictionary["ZF"] = 1
            }
            else{
                flagDictionary["ZF"] = 0
            }
            if (registerValueDictionary["A"][0] == '1'){
                flagDictionary["SF"] = 1
            }
            else{
                flagDictionary["SF"] = 0
            }
        }

        else if (opcode == "b"){
            // console.log("B", opcode,addMode,operand)

            registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            if (addMode == "01"){
                registerValueDictionary[registerDictionary[operand]] = complement(registerValueDictionary[registerDictionary[operand]])
                if (registerValueDictionary[registerDictionary[operand]]   == "0".padStart(16,"0")){
                    flagDictionary["ZF"] = 1
                }
                else{
                    flagDictionary["ZF"] = 0
                }
                if (registerValueDictionary[registerDictionary[operand]][0] == '1'){
                    flagDictionary["SF"] = 1
                }
                else{
                    flagDictionary["SF"] = 0
                }
            }
            else if (addMode == "10"){
                stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)] = complement(stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)])
                if (stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)] == "0".padStart(16,"0")){
                    flagDictionary["ZF"] = 1
                }
                else{
                    flagDictionary["ZF"] = 0
                }
                if (stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)][0] == '1'){
                    flagDictionary["SF"] = 1
                }
                else{
                    flagDictionary["SF"] = 0
                }
            }
            else if (addMode == "11"){
                stack[parseInt(operand, 16)] = complement(stack[parseInt(operand, 16)])
                if (stack[parseInt(operand, 16)] == "0".padStart(16,"0")){
                    flagDictionary["ZF"] = 1
                }
                else{
                    flagDictionary["ZF"] = 0
                }
                if (stack[parseInt(operand, 16)][0] == '1'){
                    flagDictionary["SF"] = 1
                }
                else{
                    flagDictionary["SF"] = 0
                }
            }
        }
        else if (opcode == "c"){
            // console.log("C", opcode,addMode,operand)

            registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            if (addMode == "01"){
                binary = registerValueDictionary[registerDictionary[operand]]
                value = (parseInt(registerValueDictionary[registerDictionary[operand]], 2) << 1).toString(2)
                registerValueDictionary[registerDictionary[operand]] = `${value}`
                if (registerValueDictionary[registerDictionary[operand]]   == "0".padStart(16,"0")){
                    flagDictionary["ZF"] = 1
                }
                else{
                    flagDictionary["ZF"] = 0
                }
                if (registerValueDictionary[registerDictionary[operand]][0] == '1'){
                    flagDictionary["SF"] = 1
                }
                else{
                    flagDictionary["SF"] = 0
                }
                if (binary[0] == '1'){
                 flagDictionary['CF'] = 1
                }
                else{
                 flagDictionary['CF'] = 0
                }
            }
        }
        else if (opcode == "d"){
            // console.log("D", opcode,addMode,operand)

            registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            flagDictionary['SF'] = 0
            if (addMode == "01"){
                value = (parseInt(registerValueDictionary[registerDictionary[operand]], 2) >> 1).toString(2)
                registerValueDictionary[registerDictionary[operand]] = `${value}`
                if (registerValueDictionary[registerDictionary[operand]]   == "0".padStart(16,"0")){
                    flagDictionary["ZF"] = 1
                }
                else{
                    flagDictionary["ZF"] = 0
                }
            }
        }
        else if(opcode == 'e'){
            // console.log("E", opcode,addMode,operand)

        registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
        }
        else if(opcode == 'f'){
            // console.log("F", opcode,addMode,operand)

            registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            if (addMode == '01'){
            stack[parseInt(registerValueDictionary["S"], 2)] = registerValueDictionary[registerDictionary[operand]]
            registerValueDictionary["S"] = add(registerValueDictionary["S"], add(complement("2".padStart(16,0)), "1".padStart(16,0)))
            }
        }
        else if(opcode == '10'){
            // console.log("ON", opcode,addMode,operand)

            registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            if (addMode == '01'){
                registerValueDictionary["S"] = add(registerValueDictionary["S"], "2".padStart(16,0))
                registerValueDictionary[registerDictionary[operand]] = stack[parseInt(registerValueDictionary["S"], 2)]
                stack[parseInt(registerValueDictionary["S"], 2)] = ''
            }
        }
        else if (opcode == '11'){
            // console.log("ONBİR", opcode,addMode,operand)

            registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            if (addMode == "00"){
                let value = parseInt(operand, 16)
                c = carry(registerValueDictionary['A'], add(complement(`${value}`), "1".padStart(16,"0")))
                compare = add(registerValueDictionary['A'], add(complement(`${value}`),  "1".padStart(16,"0")))
                if (c){
                    flagDictionary['CF'] = 1
                }
                else{
                    flagDictionary['CF'] = 0
                }
            }
            else if (addMode == "01"){
                c = carry(registerValueDictionary['A'], add(complement(registerValueDictionary[registerDictionary[operand]]),  "1".padStart(16,"0")))
                compare = add(registerValueDictionary['A'], add(complement(registerValueDictionary[registerDictionary[operand]]),"1".padStart(16,"0")))
                if (c){
                    flagDictionary['CF'] = 1
                }
                else{
                    flagDictionary['CF'] = 0
                }
            }
            else if (addMode == "10"){
                c = carry(registerValueDictionary["A"],add(complement(stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)]), "1".padStart(16,"0")))
                compare = add(registerValueDictionary["A"], add(complement(stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)]), "1".padStart(16,"0")))
                if (c){
                    flagDictionary['CF'] = 1
                }
                else{
                    flagDictionary['CF'] = 0
                }
            }
            else if (addMode == "11"){
                c = carry(registerValueDictionary["A"], add(complement(stack[parseInt(operand, 16)]), "1".padStart(16,"0")))
                compare = add(registerValueDictionary["A"], add(complement(stack[int(operand, 16)]), "1".padStart(16,"0")))
                if (c){
                    flagDictionary['CF'] = 1
                }
                else{
                    flagDictionary['CF'] = 0
                }
            }
            if (compare == "1".padStart(16,"0")){
                flagDictionary["ZF"] = 1
            }
            else {
                flagDictionary["ZF"] = 0
            }
            if (compare[0] == '1'){
                flagDictionary['SF'] = 1
            }
            else {
                flagDictionary['SF'] = 0
            }
        }
        else if (opcode == '12'){
            // console.log("ONİKİ", opcode,addMode,operand)

            if (addMode == '00'){
                let value = parseInt(operand, 16).toString(2)
                registerValueDictionary["PC"] = value
            }
        }
        else if (opcode == '13'){
            // console.log("ONÜÇ", opcode,addMode,operand)

            if (addMode == '00'){
                if (flagDictionary['ZF'] == 1){
                    let value = parseInt(operand, 16).toString(2)
                    registerValueDictionary["PC"] = value
                }
                else {
                    registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
                }
            }
        }
        else if(opcode == '14'){
            // console.log("ONDÖRT", opcode,addMode,operand)

            if (addMode == '00'){
                if (flagDictionary['ZF'] == 0){
                    let value = parseInt(operand,16).toString(2).padStart(16,"0")
                    registerValueDictionary["PC"] =value
                    // console.log(value)
                }
                else {
                    registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
                }
            }
        }

        else if (opcode == '15'){
            // console.log("ONBEŞ", opcode,addMode,operand)

            if (addMode == '00'){
                if (flagDictionary['CF'] == 1){
                    let value = parseInt(operand,16).toString(2).padStart(16,"0")
                    registerValueDictionary["PC"] = value
                }
                else{
                    registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
                }
            }
        }
        else if(opcode == '16'){
            // console.log("ONALTI", opcode,addMode,operand)

            if (addMode == '00'){
                if (flagDictionary['CF'] == 0){
                    let value = parseInt(operand,16).toString(2).padStart(16,"0")
                    registerValueDictionary["PC"] = value
                }
                else{
                    registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
                }
            }
        }

        else if (opcode == '17'){
            // console.log("ONYEDİ", opcode,addMode,operand)

            if (addMode == '00'){
                if (flagDictionary['SF'] == 0 && flagDictionary['ZF'] == 0){
                    let value = parseInt(operand,16).toString(2).padStart(16,"0")
                    registerValueDictionary["PC"] = value
                }
                else{
                    registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
                }
            }
        }

        else if (opcode == '18'){
            // console.log("ONSEKİZ", opcode,addMode,operand)

            if (addMode == '00'){
                if (flagDictionary['SF'] == 0 && flagDictionary['ZF'] == 1){
                    let value = parseInt(operand,16).toString(2).padStart(16,"0")
                    registerValueDictionary["PC"] = value                
                }
                else{
                    registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
                }
            }
        }
        else if (opcode == '19'){
            // console.log("ONDOKUZ", opcode,addMode,operand)

            if (addMode == '00'){
                if (flagDictionary['SF'] == 1 && flagDictionary['ZF'] == 0){
                    let value = parseInt(operand,16).toString(2).padStart(16,"0")
                    registerValueDictionary["PC"] = value                
                }
                else{
                    registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
                }
            }
        }
        else if (opcode == '1a'){
            // console.log("1A", opcode,addMode,operand)

            if (addMode == '00'){
                if (flagDictionary['SF'] == 1 && flagDictionary['ZF'] == 1){
                    let value = parseInt(operand,16).toString(2).padStart(16,"0")
                    registerValueDictionary["PC"] = value                
                }
                else{
                    registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
                }
            }
        }
        else if (opcode == '1b'){
            // console.log("1B", opcode,addMode,operand)

            let userInput = window.prompt()
            if (addMode == '01'){
                let value = userInput[0].charCodeAt().toString(2).padStart(16,"0")
                registerValueDictionary[registerDictionary[operand]] = value
                registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            }
            else if(addMode == '10'){
                let value = userInput[0].charCodeAt().toString(2).padStart(16,"0")

                stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)] =value
                registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            }
            else if (addMode == '11'){
                let value = userInput[0].charCodeAt().toString(2).padStart(16,"0")
                stack[parseInt(operand, 16)] =value
                registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            }
        }
        else if (opcode == '1c'){
            // console.log("1C", opcode,addMode,operand)
            // console.log(registerValueDictionary["PC"])
            registerValueDictionary["PC"] = add(registerValueDictionary["PC"], '0000000000000011')
            if (addMode == "00"){
                let value =String.fromCharCode(parseInt(operand, 16))
                fs.appendFileSync(fileNameToWrite,value + "\n", function (err) {
                    if (err) throw err;
                });
            }
            else if (addMode == "01"){
                let value =String.fromCharCode(parseInt(registerValueDictionary[registerDictionary[operand]], 2))
                // console.log(value)
                    fs.appendFileSync(fileNameToWrite,value + "\n", function (err) {
                        if (err) throw err;
                    });
            }
            else if(addMode == '10'){
                let value =String.fromCharCode(parseInt(stack[parseInt(registerValueDictionary[registerDictionary[operand]], 2)], 2))
                    fs.appendFileSync(fileNameToWrite,value + "\n", function (err) {
                        if (err) throw err;
                    });
            }
            else if (addMode == '11'){
                let value =String.fromCharCode(parseInt(stack[operand],2))
                    fs.appendFileSync(fileNameToWrite,value + "\n", function (err) {
                        if (err) throw err;
                    });
            
            }

        }

    }
}
)
};
cpu514exec()