/*
* Imports
*/
const fs = require("fs");
const path = require('path');


/*
* Add Function
*/
function add(value1,value2)
{
    let c = 0
    newValue = ''
    for(let i = value1.length - 1;i >= 0;i--)
    {
        newValue = ((Number(value1[i]) + Number(value2[i]) + c) % 2).toString() + newValue
        c = ((Number(value1[i]) + Number(value2[i]) + c) - (Number(value1[i]) + Number(value2[i]) + c) % 2) / 2
    }
    return newValue
}

/*
* Carry Function
*/
function carry(value1,value2)
{
    c = 0
    newValue = ''
    for(let i = value1.length - 1;i >= 0;i--)
    {
        newValue = ((Number(value1[i]) + Number(value2[i]) + c) % 2).toString() + newValue
        c = ((Number(value1[i]) + Number(value2[i]) + c) - (Number(value1[i]) + Number(value2[i]) + c) % 2) / 2
    }
    if(c == 1)
    {
        return true
    }
    else
    {
        return false
    }
}

/*
* Complement Function
*/
function complement(value)
{
    newValue = ''
    for(i = 0;i < 16;i++)
    {
        if(value[i] == '0')
        {
            newValue += '1'
        }
        else
        {
            newValue += '0'
        }
    }
    return newValue
}

/*
* Main Function (CPU514Exec)
*/
function cpu514exec()
{
    // initial variables
    let fileNameToRead = process.argv.slice(2)[0]
    let fileNameToWrite = fileNameToRead.split(".bin")[0] + ".txt"
    let prog_txt = ""
    let registerValueJson = {
        "A": "0000000000000000","B": "0000000000000000",
        "C": "0000000000000000","D": "0000000000000000",
        "E": "0000000000000000","S": "1111111111111111","PC": "0000000000000000"
    }
    let registerJson = {"1": "A","2": "B","3": "C","4": "D","5": "E","6": "S","0": "PC"}
    let flagJson = {'ZF': 0,'CF': 0,'SF': 0}
    let stackInitial = ["0000000000000000"]
    let stack = []

    // creating stack
    for(let i = 0;i < 65536;i++)
    {
        stack = stack.concat(stackInitial)
    }

    let opcode
    let addressingMode
    let operand
    let i = 0

    // read bin file and apply operations
    fs.readFile(path.join(__dirname,fileNameToRead),'utf-8',(err,data) =>
    {
        let text = data.split("\n")

        for(line of text)
        {
            line = line.trim()
            binary = parseInt(line,16).toString(2).padStart(24,"0")
            opcode = parseInt(binary.slice(0,6),2).toString(16)
            addressingMode = binary.slice(6,8)
            operand = parseInt(binary.slice(8,),2).toString(16)
            stack[i] = opcode
            stack[i + 1] = addressingMode
            stack[i + 2] = operand
            i += 3
        }

        while(true)
        {
            opcode = stack[parseInt(registerValueJson["PC"],2)]
            addressingMode = stack[parseInt(registerValueJson["PC"],2) + 1]
            operand = stack[parseInt(registerValueJson["PC"],2) + 2]

            // HALT
            if(opcode == "1")
            {
                break;
            }

            // LOAD
            else if(opcode == "2")
            {
                registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')

                // operand is immediate data
                if(addressingMode == "00")
                {
                    let value = parseInt(operand,16).toString(2).padStart(16,"0")
                    registerValueJson["A"] = `${value}`
                }

                // operand is in given in the register
                else if(addressingMode == "01")
                {
                    registerValueJson["A"] = registerValueJson[registerJson[operand]]
                }

                // operand’s memory address is given in the register
                else if(addressingMode == '10')
                {
                    registerValueJson["A"] = stack[parseInt(registerValueJson[registerJson[operand]],2)]
                }

                // operand is a memory address
                else if(addressingMode == '11')
                {
                    registerValueJson["A"] = stack[int(operand,16)]
                }
            }

            // STORE
            else if(opcode == "3")
            {

                registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')

                // operand is in given in the register                
                if(addressingMode == "01")
                {
                    registerValueJson[registerJson[operand]] = registerValueJson["A"]
                }

                // operand’s memory address is given in the register
                else if(addressingMode == '10')
                {
                    stack[parseInt(registerValueJson[registerJson[operand]],2)] = registerValueJson["A"]
                }

                // operand is a memory address
                else if(addressingMode == '11')
                {
                    stack[parseInt(operand,16)] = registerValueJson["A"]
                }
            }

            // ADD
            else if(opcode == "4")
            {
                registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')
                flagJson['SF'] = 0

                // operand is immediate data
                if(addressingMode == "00")
                {
                    let value = parseInt(operand,16).toString(2).padStart(16,"0")
                    c = carry(registerValueJson["A"],`${value}`)
                    registerValueJson["A"] = add(registerValueJson["A"],`${value}`)
                    if(c)
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }

                // operand is in given in the register
                else if(addressingMode == "01")
                {
                    c = carry(registerValueJson["A"],registerValueJson[registerJson[operand]])
                    registerValueJson["A"] = add(registerValueJson["A"],registerValueJson[registerJson[operand]])
                    if(c)
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }

                // operand’s memory address is given in the register
                else if(addressingMode == '10')
                {
                    c = carry(registerValueJson["A"],stack[parseInt(registerValueJson[registerJson[operand]],2)])
                    registerValueJson["A"] = add(registerValueJson["A"],stack[parseInt(registerValueJson[registerJson[operand]],2)])
                    if(c)
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }

                // operand is a memory address
                else if(addressingMode == '11')
                {
                    c = carry(registerValueJson["A"],stack[int(operand,16)])
                    registerValueJson["A"] = add(registerValueJson["A"],stack[int(operand,16)])
                    if(c)
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }
                if(registerValueJson["A"] == "0".padStart(16,"0"))
                {
                    flagJson["ZF"] = 1
                }
                else
                {
                    flagJson["ZF"] = 0
                }
                if(registerValueJson["A"][0] == '1')
                {
                    flagJson["SF"] = 1
                }
                else
                {
                    flagJson["SF"] = 0
                }
            }

            // SUB
            else if(opcode == "5")
            {
                registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')

                // operand is immediate data
                if(addressingMode == "00")
                {
                    let value = parseInt(operand,16).toString(2).padStart(16,"0")
                    c = carry(registerValueJson['A'],add(complement(`${value}`),"1".padStart(16,"0")))
                    registerValueJson['A'] = add(registerValueJson['A'],add(complement(`${value}`),"1".padStart(16,"0")))
                    if(c)
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }

                // operand is in given in the register
                else if(addressingMode == "01")
                {
                    c = carry(registerValueJson['A'],add(complement(registerValueJson[registerJson[operand]]),"1".padStart(16,"0")))
                    registerValueJson['A'] = add(registerValueJson['A'],add(complement(registerValueJson[registerJson[operand]]),"1".padStart(16,"0")))
                    if(c)
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }

                // operand’s memory	address	is	given	in	the	register
                else if(addressingMode == "10")
                {
                    c = carry(registerValueJson["A"],add(complement(stack[parseInt(registerValueJson[registerJson[operand]],2)]),"1".padStart(16,"0")))
                    registerValueJson["A"] = add(registerValueJson["A"],add(complement(stack[parseInt(registerValueJson[registerJson[operand]],2)]),"1".padStart(16,"0")))
                    if(c)
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }
                else if(addressingMode == "11")
                {
                    c = carry(registerValueJson["A"],add(complement(stack[parseInt(operand,16)]),"1".padStart(16,"0")))
                    registerValueJson["A"] = add(registerValueJson["A"],add(complement(stack[parseInt(operand,16)]),"1".padStart(16,"0")))
                    if(c)
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }
                if(registerValueJson["A"] == "0".padStart(16,"0"))
                {
                    flagJson["ZF"] = 1
                }
                else
                {
                    flagJson["ZF"] = 0
                }
                if(registerValueJson["A"][0] == '1')
                {
                    flagJson["SF"] = 1
                }
                else
                {
                    flagJson["SF"] = 0
                }
            }

            // INC
            else if(opcode == "6")
            {
                registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')

                // operand is in given in the register
                if(addressingMode == "01")
                {
                    c = carry(registerValueJson[registerJson[operand]],"1".padStart(16,"0"))
                    registerValueJson[registerJson[operand]] = add(registerValueJson[registerJson[operand]],"1".padStart(16,"0"))
                    if(registerValueJson[registerJson[operand]] == "0".padStart(16,"0"))
                    {
                        flagJson["ZF"] = 1
                    }
                    else
                    {
                        flagJson["ZF"] = 0
                    }
                    if(registerValueJson[registerJson[operand]][0] == '1')
                    {
                        flagJson["SF"] = 1
                    }
                    else
                    {
                        flagJson["SF"] = 0
                    }
                    if(c)
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }
                else if(addressingMode == "10")
                {
                    c = carry(stack[parseInt(registerValueJson[registerJson[operand]],2)],"1".padStart(16,"0"))
                    stack[parseInt(registerValueJson[registerJson[operand]],2)] = add(stack[parseInt(registerValueJson[registerJson[operand]],2)],"1".padStart(16,"0"))
                    if(stack[parseInt(registerValueJson[registerJson[operand]],2)] == "0".padStart(16,"0"))
                    {
                        flagJson["ZF"] = 1
                    }
                    else
                    {
                        flagJson["ZF"] = 0
                    }
                    if(stack[parseInt(registerValueJson[registerJson[operand]],2)][0] == '1')
                    {
                        flagJson["SF"] = 1
                    }
                    else
                    {
                        flagJson["SF"] = 0
                    }
                    if(c)
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }
                else if(addressingMode == "11")
                {
                    c = carry(stack[parseInt(operand,16)],"1".padStart(16,"0"))
                    stack[parseInt(operand,16)] = add(stack[parseInt(operand,16)],"1".padStart(16,"0"))
                    if(stack[parseInt(operand,16)] == "0".padStart(16,"0"))
                    {
                        flagJson["ZF"] = 1
                    }
                    else
                    {
                        flagJson["ZF"] = 0
                    }
                    if(stack[parseInt(operand,16)][0] == '1')
                    {
                        flagJson["SF"] = 1
                    }
                    else
                    {
                        flagJson["SF"] = 0
                    }
                    if(c)
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }
            }

            // DEC
            else if(opcode == "7")
            {
                registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')

                // operand is in given in the register
                if(addressingMode == "01")
                {
                    c = carry(registerValueJson[registerJson[operand]],add(complement("1".padStart(16,"0")),"1".padStart(16,"0")))
                    registerValueJson[registerJson[operand]] = add(registerValueJson[registerJson[operand]],add(complement("1".padStart(16,"0")),"1".padStart(16,"0")))
                    if(registerValueJson[registerJson[operand]] == "0".padStart(16,"0"))
                    {
                        flagJson["ZF"] = 1
                    }
                    else
                    {
                        flagJson["ZF"] = 0
                    }
                    if(registerValueJson[registerJson[operand]][0] == '1')
                    {
                        flagJson["SF"] = 1
                    }
                    else
                    {
                        flagJson["SF"] = 0
                    }
                    if(c)
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }
                else if(addressingMode == "10")
                {
                    c = carry(stack[int(registerValueJson[registerJson[operand]],2)],add(complement("1".padStart(16,"0")),"1".padStart(16,"0")))
                    stack[parseInt(registerValueJson[registerJson[operand]],2)] = add(stack[parseInt(registerValueJson[registerJson[operand]],2)],add(complement("1".padStart(16,"0")),"1".padStart(16,"0")))
                    if(stack[parseInt(registerValueJson[registerJson[operand]],2)] == "0".padStart(16,"0"))
                    {
                        flagJson["ZF"] = 1
                    }
                    else
                    {
                        flagJson["ZF"] = 0
                    }
                    if(stack[parseInt(registerValueJson[registerJson[operand]],2)][0] == '1')
                    {
                        flagJson["SF"] = 1
                    }
                    else
                    {
                        flagJson["SF"] = 0
                    }
                    if(c)
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }
                else if(addressingMode == "11")
                {
                    c = carry(stack[parseInt(operand,16)],add(complement("1".padStart(16,"0")),"1".padStart(16,"0")))
                    stack[parseInt(operand,16)] = add(stack[parseInt(operand,16)],add(complement("1".padStart(16,"0")),"1".padStart(16,"0")))
                    if(stack[parseInt(operand,16)] == "0".padStart(16,"0"))
                    {
                        flagJson["ZF"] = 1
                    }
                    else
                    {
                        flagJson["ZF"] = 0
                    }
                    if(stack[parseInt(operand,16)][0] == '1')
                    {
                        flagJson["SF"] = 1
                    }
                    else
                    {
                        flagJson["SF"] = 0
                    }
                    if(c)
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }
            }

            // XOR
            else if(opcode == "8")
            {
                registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')

                // operand is immediate data
                if(addressingMode == "00")
                {
                    let value = (parseInt(registerValueJson["A"],2) ^ parseInt(operand,16)).toString(2)
                    registerValueJson["A"] = `${value}`
                }

                // operand is in given in the register
                else if(addressingMode == "01")
                {
                    let value = (parseInt(registerValueJson["A"],2) ^ parseInt(registerValueJson[registerJson[operand]],2)).toString(2)
                    registerValueJson["A"] = `${value}`
                }
                else if(addressingMode == "10")
                {
                    let value = (parseInt(registerValueJson["A"],2) ^ parseInt(stack[parseInt(registerValueJson[registerJson[operand]],2)],2)).toString(2)
                    registerValueJson["A"] = `${value}`
                }
                else if(addressingMode == "11")
                {
                    let value = (parseInt(registerValueJson["A"],2) ^ parseInt(stack[parseInt(operand,16)],2)).toString(2)
                    registerValueJson["A"] = `${value}`
                }
                if(registerValueJson["A"] == "0".padStart(16,"0"))
                {
                    flagJson["ZF"] = 1
                }
                else
                {
                    flagJson["ZF"] = 0
                }
                if(registerValueJson["A"][0] == '1')
                {
                    flagJson["SF"] = 1
                }
                else
                {
                    flagJson["SF"] = 0
                }
            }

            // AND
            else if(opcode == "9")
            {
                registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')

                // operand is immediate data
                if(addressingMode == "00")
                {
                    let value = (parseInt(registerValueJson["A"],2) & parseInt(operand,16)).toString(2)
                    registerValueJson["A"] = `${value}`
                }

                // operand is in given in the register
                else if(addressingMode == "01")
                {
                    let value = (parseInt(registerValueJson["A"],2) & parseInt(registerValueJson[registerJson[operand]],2)).toString(2)
                    registerValueJson["A"] = `${value}`
                }
                else if(addressingMode == "10")
                {
                    let value = (parseInt(registerValueJson["A"],2) & parseInt(stack[parseInt(registerValueJson[registerJson[operand]],2)],2)).toString(2)
                    registerValueJson["A"] = `${value}`
                }
                else if(addressingMode == "11")
                {
                    let value = (parseInt(registerValueJson["A"],2) & parseInt(stack[parseInt(operand,16)],2)).toString(2)
                    registerValueJson["A"] = `${value}`
                }
                if(registerValueJson["A"] == "0".padStart(16,"0"))
                {
                    flagJson["ZF"] = 1
                }
                else
                {
                    flagJson["ZF"] = 0
                }
                if(registerValueJson["A"][0] == '1')
                {
                    flagJson["SF"] = 1
                }
                else
                {
                    flagJson["SF"] = 0
                }
            }

            // OR
            else if(opcode == "a")
            {
                registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')

                // operand is immediate data
                if(addressingMode == "00")
                {
                    let value = (parseInt(registerValueJson["A"],2) | parseInt(operand,16)).toString(2)
                    registerValueJson["A"] = `${value}`
                }

                // operand is in given in the register
                else if(addressingMode == "01")
                {
                    let value = (parseInt(registerValueJson["A"],2) | parseInt(stack[parseInt(registerValueJson[registerJson[operand]],2)],2)).toString(2)
                    registerValueJson["A"] = `${value}`
                }
                else if(addressingMode == "10")
                {
                    let value = (parseInt(registerValueJson["A"],2) ^ parseInt(stack[parseInt(registerValueJson[registerJson[operand]],2)],2)).toString(2)

                    registerValueJson["A"] = `${value}`
                }
                else if(addressingMode == "11")
                {
                    let value = (parseInt(registerValueJson["A"],2) | parseInt(stack[parseInt(operand,16)],2)).toString(2)
                    registerValueJson["A"] = `${value}`
                }
                if(registerValueJson["A"] == "0".padStart(16,"0"))
                {
                    flagJson["ZF"] = 1
                }
                else
                {
                    flagJson["ZF"] = 0
                }
                if(registerValueJson["A"][0] == '1')
                {
                    flagJson["SF"] = 1
                }
                else
                {
                    flagJson["SF"] = 0
                }
            }

            // NOT
            else if(opcode == "b")
            {
                registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')

                // operand is in given in the register
                if(addressingMode == "01")
                {
                    registerValueJson[registerJson[operand]] = complement(registerValueJson[registerJson[operand]])
                    if(registerValueJson[registerJson[operand]] == "0".padStart(16,"0"))
                    {
                        flagJson["ZF"] = 1
                    }
                    else
                    {
                        flagJson["ZF"] = 0
                    }
                    if(registerValueJson[registerJson[operand]][0] == '1')
                    {
                        flagJson["SF"] = 1
                    }
                    else
                    {
                        flagJson["SF"] = 0
                    }
                }
                else if(addressingMode == "10")
                {
                    stack[parseInt(registerValueJson[registerJson[operand]],2)] = complement(stack[parseInt(registerValueJson[registerJson[operand]],2)])
                    if(stack[parseInt(registerValueJson[registerJson[operand]],2)] == "0".padStart(16,"0"))
                    {
                        flagJson["ZF"] = 1
                    }
                    else
                    {
                        flagJson["ZF"] = 0
                    }
                    if(stack[parseInt(registerValueJson[registerJson[operand]],2)][0] == '1')
                    {
                        flagJson["SF"] = 1
                    }
                    else
                    {
                        flagJson["SF"] = 0
                    }
                }
                else if(addressingMode == "11")
                {
                    stack[parseInt(operand,16)] = complement(stack[parseInt(operand,16)])
                    if(stack[parseInt(operand,16)] == "0".padStart(16,"0"))
                    {
                        flagJson["ZF"] = 1
                    }
                    else
                    {
                        flagJson["ZF"] = 0
                    }
                    if(stack[parseInt(operand,16)][0] == '1')
                    {
                        flagJson["SF"] = 1
                    }
                    else
                    {
                        flagJson["SF"] = 0
                    }
                }
            }

            // SHL
            else if(opcode == "c")
            {
                registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')

                // operand is in given in the register
                if(addressingMode == "01")
                {
                    binary = registerValueJson[registerJson[operand]]
                    value = (parseInt(registerValueJson[registerJson[operand]],2) << 1).toString(2)
                    registerValueJson[registerJson[operand]] = `${value}`
                    if(registerValueJson[registerJson[operand]] == "0".padStart(16,"0"))
                    {
                        flagJson["ZF"] = 1
                    }
                    else
                    {
                        flagJson["ZF"] = 0
                    }
                    if(registerValueJson[registerJson[operand]][0] == '1')
                    {
                        flagJson["SF"] = 1
                    }
                    else
                    {
                        flagJson["SF"] = 0
                    }
                    if(binary[0] == '1')
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }
            }

            // SHR
            else if(opcode == "d")
            {
                registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')
                flagJson['SF'] = 0

                // operand is in given in the register
                if(addressingMode == "01")
                {
                    value = (parseInt(registerValueJson[registerJson[operand]],2) >> 1).toString(2)
                    registerValueJson[registerJson[operand]] = `${value}`
                    if(registerValueJson[registerJson[operand]] == "0".padStart(16,"0"))
                    {
                        flagJson["ZF"] = 1
                    }
                    else
                    {
                        flagJson["ZF"] = 0
                    }
                }
            }

            // NOP
            else if(opcode == 'e')
            {
                registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')
            }

            // PUSH
            else if(opcode == 'f')
            {
                registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')
                if(addressingMode == '01')
                {
                    stack[parseInt(registerValueJson["S"],2)] = registerValueJson[registerJson[operand]]
                    registerValueJson["S"] = add(registerValueJson["S"],add(complement("2".padStart(16,0)),"1".padStart(16,0)))
                }
            }

            // POP
            else if(opcode == '10')
            {
                registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')
                if(addressingMode == '01')
                {
                    registerValueJson["S"] = add(registerValueJson["S"],"2".padStart(16,0))
                    registerValueJson[registerJson[operand]] = stack[parseInt(registerValueJson["S"],2)]
                    stack[parseInt(registerValueJson["S"],2)] = ''
                }
            }

            // CMP
            else if(opcode == '11')
            {
                registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')

                // operand is immediate data
                if(addressingMode == "00")
                {
                    let value = parseInt(operand,16)
                    c = carry(registerValueJson['A'],add(complement(`${value}`),"1".padStart(16,"0")))
                    compare = add(registerValueJson['A'],add(complement(`${value}`),"1".padStart(16,"0")))
                    if(c)
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }

                // operand is in given in the register
                else if(addressingMode == "01")
                {
                    c = carry(registerValueJson['A'],add(complement(registerValueJson[registerJson[operand]]),"1".padStart(16,"0")))
                    compare = add(registerValueJson['A'],add(complement(registerValueJson[registerJson[operand]]),"1".padStart(16,"0")))
                    if(c)
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }
                else if(addressingMode == "10")
                {
                    c = carry(registerValueJson["A"],add(complement(stack[parseInt(registerValueJson[registerJson[operand]],2)]),"1".padStart(16,"0")))
                    compare = add(registerValueJson["A"],add(complement(stack[parseInt(registerValueJson[registerJson[operand]],2)]),"1".padStart(16,"0")))
                    if(c)
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }
                else if(addressingMode == "11")
                {
                    c = carry(registerValueJson["A"],add(complement(stack[parseInt(operand,16)]),"1".padStart(16,"0")))
                    compare = add(registerValueJson["A"],add(complement(stack[int(operand,16)]),"1".padStart(16,"0")))
                    if(c)
                    {
                        flagJson['CF'] = 1
                    }
                    else
                    {
                        flagJson['CF'] = 0
                    }
                }
                if(compare == "1".padStart(16,"0"))
                {
                    flagJson["ZF"] = 1
                }
                else
                {
                    flagJson["ZF"] = 0
                }
                if(compare[0] == '1')
                {
                    flagJson['SF'] = 1
                }
                else
                {
                    flagJson['SF'] = 0
                }
            }

            // JMP
            else if(opcode == '12')
            {
                if(addressingMode == '00')
                {
                    let value = parseInt(operand,16).toString(2)
                    registerValueJson["PC"] = value
                }
            }

            // JZ - JE
            else if(opcode == '13')
            {
                if(addressingMode == '00')
                {
                    if(flagJson['ZF'] == 1)
                    {
                        let value = parseInt(operand,16).toString(2)
                        registerValueJson["PC"] = value
                    }
                    else
                    {
                        registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')
                    }
                }
            }

            // JNZ - JNE
            else if(opcode == '14')
            {
                if(addressingMode == '00')
                {
                    if(flagJson['ZF'] == 0)
                    {
                        let value = parseInt(operand,16).toString(2).padStart(16,"0")
                        registerValueJson["PC"] = value
                    }
                    else
                    {
                        registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')
                    }
                }
            }

            // JC
            else if(opcode == '15')
            {

                if(addressingMode == '00')
                {
                    if(flagJson['CF'] == 1)
                    {
                        let value = parseInt(operand,16).toString(2).padStart(16,"0")
                        registerValueJson["PC"] = value
                    }
                    else
                    {
                        registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')
                    }
                }
            }

            // JNC
            else if(opcode == '16')
            {
                if(addressingMode == '00')
                {
                    if(flagJson['CF'] == 0)
                    {
                        let value = parseInt(operand,16).toString(2).padStart(16,"0")
                        registerValueJson["PC"] = value
                    }
                    else
                    {
                        registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')
                    }
                }
            }

            // JA
            else if(opcode == '17')
            {
                if(addressingMode == '00')
                {
                    if(flagJson['SF'] == 0 && flagJson['ZF'] == 0)
                    {
                        let value = parseInt(operand,16).toString(2).padStart(16,"0")
                        registerValueJson["PC"] = value
                    }
                    else
                    {
                        registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')
                    }
                }
            }

            // JAE
            else if(opcode == '18')
            {

                if(addressingMode == '00')
                {
                    if(flagJson['SF'] == 0 && flagJson['ZF'] == 1)
                    {
                        let value = parseInt(operand,16).toString(2).padStart(16,"0")
                        registerValueJson["PC"] = value
                    }
                    else
                    {
                        registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')
                    }
                }
            }

            // JB
            else if(opcode == '19')
            {

                if(addressingMode == '00')
                {
                    if(flagJson['SF'] == 1 && flagJson['ZF'] == 0)
                    {
                        let value = parseInt(operand,16).toString(2).padStart(16,"0")
                        registerValueJson["PC"] = value
                    }
                    else
                    {
                        registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')
                    }
                }
            }

            // JBE
            else if(opcode == '1a')
            {

                if(addressingMode == '00')
                {
                    if(flagJson['SF'] == 1 && flagJson['ZF'] == 1)
                    {
                        let value = parseInt(operand,16).toString(2).padStart(16,"0")
                        registerValueJson["PC"] = value
                    }
                    else
                    {
                        registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')
                    }
                }
            }

            // READ
            else if(opcode == '1b')
            {
                const prompt = require('prompt-sync')();
                let userInput = prompt("Input:");
                // console.log(`Hey there ${userInput}`);

                if(addressingMode == '01')
                {
                    let value = userInput[0].charCodeAt().toString(2).padStart(16,"0")
                    registerValueJson[registerJson[operand]] = value
                    registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')
                }

                // operand’s memory address is given in the register
                else if(addressingMode == '10')
                {
                    let value = userInput[0].charCodeAt().toString(2).padStart(16,"0")

                    stack[parseInt(registerValueJson[registerJson[operand]],2)] = value
                    registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')
                }

                // operand is a memory address
                else if(addressingMode == '11')
                {
                    let value = userInput[0].charCodeAt().toString(2).padStart(16,"0")
                    stack[parseInt(operand,16)] = value
                    registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')
                }
            }

            // PRINT
            else if(opcode == '1c')
            {
                registerValueJson["PC"] = add(registerValueJson["PC"],'0000000000000011')
                let value
                // operand is immediate data
                if(addressingMode == "00")
                {
                    value = String.fromCharCode(parseInt(operand,16))
                }

                // operand is in given in the register
                else if(addressingMode == "01")
                {
                    value = String.fromCharCode(parseInt(registerValueJson[registerJson[operand]],2))
                }

                // operand’s memory address is given in the register
                else if(addressingMode == '10')
                {
                    value = String.fromCharCode(parseInt(stack[parseInt(registerValueJson[registerJson[operand]],2)],2))
                }

                // operand is a memory address
                else if(addressingMode == '11')
                {
                    value = String.fromCharCode(parseInt(stack[parseInt(operand,16)],2))
                }
                prog_txt = prog_txt + value + "\n"
                fs.writeFileSync(fileNameToWrite,prog_txt.slice(0,prog_txt.lastIndexOf("\n")),function(err)
                {
                    if(err) throw err;
                });

            }

        }
    }
    )
};
cpu514exec()