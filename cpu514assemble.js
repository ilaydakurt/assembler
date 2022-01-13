const fs = require( "fs" );
const path = require( 'path' );

 function convert ( inputOpcode, inputAddrmode, inputOperand )
// function convert (): async (inputOpcode, inputAddrmode, inputOperand ) => {
{
    // let opcode = parseInt( inputOpcode, 16 );
    let addrmode = parseInt( inputAddrmode, 16 );
    let operand = parseInt( inputOperand, 16 );

    let opcode = inputOpcode;
    // let addrmode =inputAddrmode;
    // let operand = inputOperand;
    // console.log( opcode, addrmode, operand )
    let bopcode = opcode.toString( 2 )
    bopcode=bopcode.padStart(6,"0")
    // let bitOfOpcode = 6 - bopcode.length
    // while ( bitOfOpcode > 0 )
    // {
    //     bopcode = "0" + bopcode
    //     bitOfOpcode = bitOfOpcode - 1
    // }
    let baddrmode = addrmode.toString( 2 )
    baddrmode= baddrmode.padStart(2,"0")
    // let bitOfAddrmode = 2 - baddrmode.length
    // while ( bitOfAddrmode > 0 )
    // {
    //     baddrmode = "0" + baddrmode
    //     bitOfAddrmode = bitOfAddrmode - 1
    // }
    let boperand = operand.toString( 2 )
    boperand=boperand.padStart(16,"0")
    // let bitOffOperand = 16 - boperand.length
    // while ( bitOffOperand > 0 )
    // {
    //     boperand = "0" + boperand
    //     bitOffOperand = bitOffOperand - 1
    // }

    // console.log( bopcode, baddrmode, boperand )

    let bin = '0b' + bopcode + baddrmode + boperand;
    let ibin = bin.substring( 2, )
    let instr = parseInt( bin.substring( 2, ), 2 ).toString( 16 ).padStart(6,"0");
    // console.log( instr )
    return instr
};
 async function cpu514assemble ()
{
    let fileNameToRead = process.argv.slice( 2 )[ 0 ]
    let fileNameToWrite = fileNameToRead.split(".asm")[0] + ".bin"
    let prog_bin = ""
    let memoryAddress = 0
    let labels = []
    let labelsDictionary = {}
    let registerDictionary = { "A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "S": 6, "PC": 0 }
    let instructionDictionary = {
        "HALT": 0x01, "LOAD": 0x02,
        "STORE": 0x03, "ADD": 0x04,
        "SUB": 0x05, "INC": 0x06,
        "DEC": 0x07, "XOR": 0x08,
        "AND": 0x09, "OR": 0x0A,
        "NOT": 0x0B, "SHL": 0x0C,
        "SHR": 0x0D, "NOP": 0x0E,
        "PUSH": 0x0F, "POP": 0x10,
        "CMP": 0x11, "JMP": 0x12,
        "JZ": 0x13, "JE": 0x13,
        "JNZ": 0x14, "JNE": 0x14,
        "JC": 0x15, "JNC": 0x16,
        "JA": 0x17, "JAE": 0x18,
        "JB": 0x19, "JBE": 0x1A,
        "READ": 0x1B, "PRINT": 0x1C
    }
  
    fs.readFile( path.join( __dirname, fileNameToRead ), 'utf-8', ( err, data ) =>
    {
        if ( err ) throw err;
        let text = data.split( "\n" )
        for ( line of text )
        {
            try
            {
                line = line.split( "\r" )[ 0 ]
            }
            catch {
                line = line
            }
            words = line.split(" ")
            for (word of words){
                if (word.length ===0){
                    words.splice(words.indexOf(word),1)
                }
            }
            // line = words.join(" ")
            line = line.trim()
            if (words[words.length-1][words[words.length-1].length-1] != ":"){
                memoryAddress += 3
            }else{
                labelsDictionary[words[0].split(":")[0].toUpperCase()] = Number(memoryAddress).toString(16)
                labels.push(words[0].split(":")[0].toUpperCase())
            }
        }
        for ( line of text )
        {
            try
            {
                line = line.split( "\r" )[ 0 ]
            }
            catch {
                line = line
            }
            words = line.split(" ")
            for (word of words){
                if (word.length ===0){
                    words.splice(words.indexOf(word),1)
                }
            }
            // line = words.join(" ")
            line = line.trim()
            let opcode
            let addMode
            let operand
            if (words[words.length-1][words[words.length-1].length-1] != ":"){
                // console.log(words)
                if (words[0].toUpperCase() in instructionDictionary){
                    // console.log(words[0])
                    opcode = instructionDictionary[words[0].toUpperCase()]
                    // console.log(opcode)
                }
                if (words.length == 2){
                    if (words[1][0] === "'" && words[1][words.length] === "'") {
                        addMode = 0
                        operand = "0x" + parseInt(words[1].split("'")[1].charCodeAt(),10).toString(16)
                    }
                    else if( words[1][0] == "[" && words[1][words.length] == "]"){
                        if (registerDictionary[words[1].substring(1,words.length).toUpperCase()]){
                            addMode = 2
                            operand = registerDictionary[words[1].substring(1,words.length).toUpperCase()]
                        }
                        else {
                            addMode = 3
                            operand = words[1].substring(1,words.length)
                        }
                    }

                    else if (words[1].toUpperCase() in registerDictionary){
                        addMode = 1
                        operand = registerDictionary[words[1].toUpperCase()]
                    }
                    else if( labels.includes(words[1].toUpperCase())){
                        addMode = 0
                        operand = labelsDictionary[words[1].toUpperCase()]
                        // console.log(addMode,operand)
                    }
                    else if (isNaN(words[1][0])==false){
                        addMode = 0
                        operand = words[1]
                    }
                }

                else if (words.length==1){
                    // if (words[0].toUpperCase() == 'HALT' || words[0].toUpperCase() == 'NOP'){
                    // }
                    // else{

                    // }
                    addMode = 0
                    operand = 0
                }
                let writingData= convert(opcode,addMode,operand)
                prog_bin = prog_bin +writingData + "\n"
            }
        }
        fs.writeFileSync(fileNameToWrite,prog_bin.slice(0,prog_bin.lastIndexOf("\n")).toUpperCase(), function (err) {
            if (err) throw err;
        });
    } 
    )
}
cpu514assemble()