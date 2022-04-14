import type { NextPage } from 'next'
import {ethers} from "ethers";
import { useEffect, useState, ChangeEvent} from "react";
import {FieldValues, SubmitHandler, useForm, useWatch} from "react-hook-form";
import Link from 'next/link'
import Web3Modal from 'web3modal'
import {
  Input,
  Container,
  Spacer,
  Card,
  Text,
  Button,
  Modal,
  useModal,
  Grid,
  FormElement
} from "@nextui-org/react";
import Exchange from "../artifacts/contracts/Exchange.sol/Exchange.json";
import * as deployedAddresses from "../.config";
import Token from "../artifacts/contracts/Token.sol/Token.json";
import Factory from "../artifacts/contracts/Factory.sol/Factory.json";


const Home: NextPage = () => {

  const {setVisible, bindings} = useModal();
  const [firstTokenName, setFirstTokenName] = useState<string>("")
  const [secondTokenName, setSecondTokenName] = useState<string>("");
  const [lastBtnAccessedModal, setLastBtnAccessedModal] = useState<string>("")

  const {control, register, handleSubmit, setValue} = useForm()

  const firstTokenAmount = useWatch({control, name: 'firstTokenAmount'})
  const secondTokenAmount = useWatch({control, name: 'secondTokenAmount'})
  //------------------------------------------------------------------------------

  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("")
  // const [disableToken, setDisableToken] = useState<boolean>(true);
  const [tokenSymbols, setTokenSymbols] = useState<string[]>([])



  useEffect(() => {
    const setSymbols = async () => {
      const provider = new ethers.providers.AlchemyProvider('rinkeby')
      let firstToken = new ethers.Contract(deployedAddresses.FIRST_TOKEN, Token.abi, provider)
      let secondToken = new ethers.Contract(deployedAddresses.SECOND_TOKEN, Token.abi, provider)

      // const signer = provider.getSigner()
      // const tokenFactory = new Token__factory()
      // const firstToken = tokenFactory.attach(deployedAddresses.FIRST_TOKEN)
      // const secondToken = tokenFactory.attach(deployedAddresses.SECOND_TOKEN)
      const firstTokenSymbol = await firstToken.symbol()
      const secondTokenSymbol = await secondToken.symbol()
      setTokenSymbols([firstTokenSymbol, secondTokenSymbol])
    }
    void setSymbols()
  }, [])

  const _getExchangeFromTokenName = async (isSwapping: boolean, tokenName: string) => {
    let provider
    let signer
    let tokenAddress
    let exchange
    if(tokenName == tokenSymbols[0]) tokenAddress = deployedAddresses.FIRST_TOKEN
    else tokenAddress = deployedAddresses.SECOND_TOKEN

    if(isSwapping) {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      provider = new ethers.providers.Web3Provider(connection)
      signer = provider.getSigner()
      let factory = new ethers.Contract(deployedAddresses.FACTORY, Factory.abi, signer)
      let exchangeAddress = await factory.getExchange(tokenAddress)
      exchange = new ethers.Contract(exchangeAddress, Exchange.abi, signer)
    } else {
      provider = new ethers.providers.AlchemyProvider('rinkeby')
      let factory = new ethers.Contract(deployedAddresses.FACTORY, Factory.abi, provider)
      let exchangeAddress = await factory.getExchange(tokenAddress)
      exchange = new ethers.Contract(exchangeAddress, Exchange.abi, provider)
    }

    return exchange
  }


  const handleSwap: SubmitHandler<FieldValues> = async (item) => {
    let {firstTokenAmount, secondTokenAmount} = item
    if (typeof window.ethereum == "undefined") {
      setVisible(true)
      setErrorMsg(`Metamask is not installed in your browser!`)
      return
    }

    if(firstTokenName == 'ETH' && secondTokenName == tokenSymbols[0] ||
        firstTokenName == tokenSymbols[0] && secondTokenName == 'ETH')
    {
      const exchange = await _getExchangeFromTokenName(true, tokenSymbols[0])

      let parsedFirstToken = ethers.utils.parseEther(firstTokenAmount)
      let parsedSecondToken = ethers.utils.parseEther(secondTokenAmount)



      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      let provider = new ethers.providers.Web3Provider(connection)
      let signer = provider.getSigner()
      let firstToken = new ethers.Contract(deployedAddresses.FIRST_TOKEN, Token.abi, signer)

      let firstTokenBalance = firstTokenName == 'ETH' ?
          ethers.utils.formatEther(await signer.getBalance()) :
          ethers.utils.formatEther(await firstToken.balanceOf(await signer.getAddress()))

      let firstCondition = parseInt(firstTokenBalance) < parseInt(firstTokenAmount)

      if(firstCondition) {
        setVisible(true)
        setErrorMsg(`Not enough ${firstTokenName}!`)
        return
      }

      if(firstTokenName == tokenSymbols[0]) {
        let tx = await firstToken.approve(exchange.address, parsedFirstToken)
        setIsWaiting(true)
        await tx.wait()
      }


      let swap = firstTokenName == 'ETH' ?
          await exchange.ethToTokenSwap(parsedSecondToken, {value: parsedFirstToken} ) :
          await exchange.tokenToEthSwap(parsedFirstToken, parsedSecondToken)

      setIsWaiting(true)
      await swap.wait()
      setIsWaiting(false)


    } else if(firstTokenName == 'ETH' && secondTokenName == tokenSymbols[1] ||
        firstTokenName == tokenSymbols[1] && secondTokenName == 'ETH')
    {
      const exchange = await _getExchangeFromTokenName(true, tokenSymbols[1])

      let parsedFirstToken = ethers.utils.parseEther(firstTokenAmount)
      let parsedSecondToken = ethers.utils.parseEther(secondTokenAmount)

      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      let provider = new ethers.providers.Web3Provider(connection)
      let signer = provider.getSigner()
      let secondToken = new ethers.Contract(deployedAddresses.SECOND_TOKEN, Token.abi, signer)

      let firstTokenBalance = firstTokenName == 'ETH' ?
          ethers.utils.formatEther(await signer.getBalance()) :
          ethers.utils.formatEther(await secondToken.balanceOf(await signer.getAddress()))


      let firstCondition = parseInt(firstTokenBalance) < parseInt(firstTokenAmount)

      if(firstCondition) {
        setVisible(true)
        setErrorMsg(`Not enough ${firstTokenName}!`)
        return
      }

      if(firstTokenName == tokenSymbols[1]) {
        let tx = await secondToken.approve(exchange.address, parsedFirstToken)
        setIsWaiting(true)
        await tx.wait()
      }


      let swap = firstTokenName == 'ETH' ?
          await exchange.ethToTokenSwap(parsedSecondToken, {value: parsedFirstToken} ) :
          await exchange.tokenToEthSwap(parsedFirstToken, parsedSecondToken)

      setIsWaiting(true)
      await swap.wait()
      setIsWaiting(false)

    } else if(firstTokenName == tokenSymbols[0] && secondTokenName == tokenSymbols[1] ||
        firstTokenName == tokenSymbols[1] && secondTokenName == tokenSymbols[0])
    {
      const firstExchange = await _getExchangeFromTokenName(true, tokenSymbols[0])
      const secondExchange = await _getExchangeFromTokenName(true, tokenSymbols[1])

      let parsedFirstToken = ethers.utils.parseEther(firstTokenAmount)
      let parsedSecondToken = ethers.utils.parseEther(secondTokenAmount)

      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      let provider = new ethers.providers.Web3Provider(connection)
      let signer = provider.getSigner()
      let firstToken = new ethers.Contract(deployedAddresses.FIRST_TOKEN, Token.abi, signer)
      let secondToken = new ethers.Contract(deployedAddresses.SECOND_TOKEN, Token.abi, signer)
      let signerAddress = await signer.getAddress()
      let firstTokenBalance = firstTokenName == tokenSymbols[0] ?
          ethers.utils.formatEther(await firstToken.balanceOf(signerAddress)) :
          ethers.utils.formatEther(await secondToken.balanceOf(signerAddress))


      let firstCondition = parseInt(firstTokenBalance) < parseInt(firstTokenAmount)

      if(firstCondition) {
        setVisible(true)
        setErrorMsg(`Not enough ${firstTokenName}!`)
        return
      }

      if(firstTokenName == tokenSymbols[0]) {
        let tx = await firstToken.approve(firstExchange.address, parsedFirstToken)
        setIsWaiting(true)
        await tx.wait()
      } else if(firstTokenName == tokenSymbols[1]) {
        let tx = await secondToken.approve(secondExchange.address, parsedFirstToken)
        setIsWaiting(true)
        await tx.wait()
      }

      let swap = firstTokenName == tokenSymbols[0] ?
          await firstExchange.tokenToTokenSwap(parsedFirstToken, parsedSecondToken, deployedAddresses.SECOND_TOKEN) :
          await secondExchange.tokenToTokenSwap(parsedFirstToken, parsedSecondToken, deployedAddresses.FIRST_TOKEN)

      setIsWaiting(true)
      await swap.wait()
      setIsWaiting(false)

    }

    setValue('firstTokenAmount', "")
    setValue('secondTokenAmount', "")
    setVisible(true)
    setErrorMsg('Successfully swapped tokens!')

  }

  const showTokenButton = (tokenButtonNumber: string) => {

    if (tokenButtonNumber === 'first') {
      if (!firstTokenName) {
        return (_chooseButton('Select', tokenButtonNumber))
      }
      return _chooseButton(firstTokenName, tokenButtonNumber)
    } else if (tokenButtonNumber === 'second') {
      if (!secondTokenName) {
        return (_chooseButton('Select', tokenButtonNumber))
      }
      return _chooseButton(secondTokenName, tokenButtonNumber)
    }

  }

  const _chooseButton = (tokenName: string, tokenButtonNumber: string) => {
    return (
        <Button auto  color="gradient" onClick={() => {
          setLastBtnAccessedModal(tokenButtonNumber)
          setVisible(true)
        }
        }>{tokenName} ∨</Button>
    )
  }

  const chooseToken = async (tokenButtonNumber: string, tokenName: string) => {


    if (tokenButtonNumber === 'first') {
      setFirstTokenName(tokenName)

      setVisible(false)
      if (!secondTokenName || !firstTokenAmount) return

      await _showTokenAmount(tokenName, secondTokenName)

    } else if (tokenButtonNumber === 'second') {
      setSecondTokenName(tokenName)

      setVisible(false)
      if (!firstTokenName || !firstTokenAmount) return

      await _showTokenAmount(firstTokenName, tokenName)
    }

  }

  const _showTokenAmount = async (firstTokenName: string, secondTokenName: string) => {
    if(firstTokenName == 'ETH' && secondTokenName == tokenSymbols[0] ||
        firstTokenName == tokenSymbols[0] && secondTokenName == 'ETH')
    {
      const exchange = await _getExchangeFromTokenName(false, tokenSymbols[0])

      let parsedToken = ethers.utils.parseEther(firstTokenAmount)
      let amountOfTokens = firstTokenName == 'ETH' ?
          await exchange.getTokenAmount(parsedToken) :
          await exchange.getEthAmount(parsedToken)


      setValue('secondTokenAmount', ethers.utils.formatEther(amountOfTokens))
    } else if(firstTokenName == 'ETH' && secondTokenName == tokenSymbols[1] ||
        firstTokenName == tokenSymbols[1] && secondTokenName == 'ETH')
    {
      const exchange = await _getExchangeFromTokenName(false, tokenSymbols[1])

      let parsedToken = ethers.utils.parseEther(firstTokenAmount)
      let amountOfTokens = firstTokenName == 'ETH' ?
          await exchange.getTokenAmount(parsedToken) :
          await exchange.getEthAmount(parsedToken)


      setValue('secondTokenAmount', ethers.utils.formatEther(amountOfTokens))
    } else if(firstTokenName == tokenSymbols[0] && secondTokenName == tokenSymbols[1] ||
        firstTokenName == tokenSymbols[1] && secondTokenName == tokenSymbols[0])
    {
      const firstExchange = await _getExchangeFromTokenName(false, tokenSymbols[0])
      const secondExchange = await _getExchangeFromTokenName(false, tokenSymbols[1])

      let parsedToken = ethers.utils.parseEther(firstTokenAmount)

      let amountOfTokens = firstTokenName == tokenSymbols[0] ?
          await firstExchange.getTokenAmountForTokenAmount(deployedAddresses.SECOND_TOKEN, parsedToken) :
          await secondExchange.getTokenAmountForTokenAmount(deployedAddresses.FIRST_TOKEN, parsedToken)

      setValue('secondTokenAmount', ethers.utils.formatEther(amountOfTokens))
    }
  }

  const handleArrowClick = async () => {
    let temp1 = firstTokenName
    let temp2 = secondTokenName
    setFirstTokenName(temp2)
    setSecondTokenName(temp1)
    setValue('firstTokenAmount', secondTokenAmount)
    setValue('secondTokenAmount', "")

  }

  const calculateTokenHandler = async () => {
    if(!firstTokenName || !secondTokenName) return

    setValue("secondTokenAmount", "")

    if (!firstTokenAmount) return

    await _showTokenAmount(firstTokenName, secondTokenName)

  }


  const checkInputHandler = (e: ChangeEvent<FormElement>) => {
    const value = e.target.value
    const isValid = value.match(/^[+]?([0-9]+\.?[0-9]*|\.[0-9]+)$/)
    if(!isValid || value.length > 15) setValue('firstTokenAmount', value.substring(0,value.length - 1))
    else {
      setValue('firstTokenAmount', value)
    }
  }

  const showModalButtons = () => {
    let buttons = []
    const first = <Button key={1} onClick={() => chooseToken(lastBtnAccessedModal, 'ETH')}><Text color="white">ETH</Text></Button>
    const second = <Button key={2} onClick={() => chooseToken(lastBtnAccessedModal, tokenSymbols[0])}><Text color="white">{tokenSymbols[0]}</Text></Button>
    const third = <Button key={3} onClick={() => chooseToken(lastBtnAccessedModal, tokenSymbols[1])}> <Text color="white">{tokenSymbols[1]}</Text></Button>
    if(!firstTokenName && !secondTokenName) buttons.push(first, second, third)
    else if(lastBtnAccessedModal == "first") {
      switch (secondTokenName) {
        case 'ETH':
          if(firstTokenName == tokenSymbols[0]) buttons.push(third)
          else if (firstTokenName == tokenSymbols[1]) buttons.push(second)
          else buttons.push(second, third)
          break
        case tokenSymbols[0]:
          if(firstTokenName == 'ETH') buttons.push(third)
          else if (firstTokenName == tokenSymbols[1]) buttons.push(first)
          else buttons.push(first, third)
          break
        case tokenSymbols[1]:
          if(firstTokenName == tokenSymbols[0]) buttons.push(first)
          else if (firstTokenName == 'ETH') buttons.push(second)
          else buttons.push(first, second)
          break
        default:
          buttons.push(first, second, third)
          break
      }
    } else if (lastBtnAccessedModal == "second") {
      switch (firstTokenName) {
        case 'ETH':
          if(secondTokenName == tokenSymbols[0]) buttons.push(third)
          else if (secondTokenName == tokenSymbols[1]) buttons.push(second)
          else buttons.push(second, third)
          break
        case tokenSymbols[0]:
          if(secondTokenName == 'ETH') buttons.push(third)
          else if (secondTokenName == tokenSymbols[1]) buttons.push(first)
          else buttons.push(first, third)
          break
        case tokenSymbols[1]:
          if(secondTokenName == tokenSymbols[0]) buttons.push(first)
          else if (secondTokenName == 'ETH') buttons.push(second)
          else buttons.push(first, second)
          break
        default:
          buttons.push(first, second, third)
          break
      }
    }
    return(
        <Button.Group size="xl" vertical color="gradient" flat>
          {buttons.map(button => button)}
        </Button.Group>
    )
  }

  return (
      <div>
        <Spacer y={5} />

        <Container xs  >
          {!isWaiting && (
          <Button.Group size="xl"  color="gradient" flat>

            <Link href={'/'}><Button><Text color="black">Swap</Text></Button></Link>
            <Link href={'/pool'}><Button><Text color="white">Pool</Text></Button></Link>
          </Button.Group>
          )};

          <Card css={{bgColor: "$blue900"}}>
            <Text h1 size={60} css={{
              textGradient: "45deg, $blue500 -20%, $pink500 50%",
              textAlign: "center"
            }}>
              {!isWaiting ? "Swap" : "Waiting for transactions..."}
            </Text>
            {!isWaiting && (
                <form onSubmit={handleSubmit(handleSwap)}>
                  <Grid.Container gap={2} justify="center">
                    <Grid  lg={9} xs={12}>
                      <Input
                          fullWidth
                          rounded
                          bordered
                          placeholder="0.00"
                          color="primary"
                          size="xl"
                          aria-label="input1"
                          {...register('firstTokenAmount', {required: true, maxLength: 15} )}
                          status="primary"
                          onChange={(e) => checkInputHandler(e) }
                          onBlur={() => calculateTokenHandler()}

                      />
                    </Grid>
                    <Grid  lg={3} xs={12} justify='center'>
                      {showTokenButton('first')}
                    </Grid>
                    {/*<Grid lg={9} justify='center' xs={12}>*/}
                    {/*  <button className="text-xs" onClick={() => handleArrowClick()}>*/}
                    {/*    <Text className="hover:text-purple-700" color='primary' size={50} >&#8623;</Text>*/}
                    {/*  </button>*/}
                    {/*</Grid>*/}
                    {/*<Grid lg={3} xs={0}/>*/}
                    <Grid lg={9} xs={12}>
                      <Input
                          fullWidth
                          rounded
                          bordered
                          placeholder="0.00"
                          color="primary"
                          size="xl"
                          aria-label="input2"
                          disabled={true}
                          {...register('secondTokenAmount', {required: true})}
                          status="primary"
                      />
                    </Grid>
                    <Grid lg={3} xs={12} justify='center'>
                      {showTokenButton('second')}
                    </Grid>
                    <Spacer y={2} />
                    <Grid lg={12} xs={12} justify='center'>
                      <Button  auto type="submit" color='gradient'>Start</Button>
                    </Grid>
                    {/*<Grid lg={3} xs={0} />*/}
                  </Grid.Container>

                </form>
            )}

          </Card>
          <Modal
              width="300px"
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
              {...bindings}
              blur
              preventClose
              // @ts-ignore
              css={{bgColor: 'black'}}
          >
            {!errorMsg ? (
                <>
                  <Modal.Header css={{cursor: 'default'}}>
                    <Text id="modal-title" size={18}>
                      Choose a currency
                    </Text>
                  </Modal.Header>
                  <Modal.Body css={{cursor: 'default'}}>
                    <Text id="modal-description">
                    </Text>
                    {showModalButtons()}
                  </Modal.Body>
                  <Modal.Footer css={{cursor: 'default'}}>
                    {/*<Button auto color="error" >*/}
                    {/*  Ok*/}
                    {/*</Button>*/}
                  </Modal.Footer>

                </>
            ) : (
                <>
                  <Modal.Header css={{cursor: 'default'}}>
                    <Text id="modal-title" css={{textGradient: "45deg, $blue500 -20%, $pink500 50%"}} size={40}>
                      {errorMsg}
                    </Text>
                  </Modal.Header>
                  <Modal.Body css={{cursor: 'default'}}>
                    <Button onClick={() => {
                      setVisible(false)
                      setErrorMsg("")
                    }}  color="error" >
                      Ok
                    </Button>
                  </Modal.Body>
                </>
            )}
          </Modal>

        </Container>
      </div>
  )

}

export default Home
