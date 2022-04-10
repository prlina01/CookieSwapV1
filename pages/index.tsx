import type { NextPage } from 'next'
import {ethers} from "ethers";
import { useEffect, useState, useMemo, ChangeEvent} from "react";
import {useForm, useWatch} from "react-hook-form";
import Link from 'next/link'
import Web3Modal from 'web3modal'
import {
  Input,
  Container,
  Row,
  Col,
  Spacer,
  Card,
  Text,
  Button,
  Modal,
  useModal,
  Loading,
  Radio,
  Grid,
  FormElement
} from "@nextui-org/react";
import Exchange from "../artifacts/contracts/Exchange.sol/Exchange.json";


const Home: NextPage = () => {

  const handleSwap = async () => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()



  }
    const {setVisible, bindings} = useModal();
  const [firstToken, setFirstToken] = useState<string>("")
  const [secondToken, setSecondToken] = useState<string>("");
  const [lastBtnAccessedModal, setLastBtnAccessedModal] = useState<string>("")

  const {control, reset, register, handleSubmit, formState, setValue} = useForm()

  const firstTokenAmount = useWatch({control, name: 'firstTokenAmount'})
  const secondTokenAmount = useWatch({control, name: 'secondTokenAmount'})


  useEffect(() => {
    reset({
      firstTokenAmount: '',
      secondTokenAmount: ''
    })
  }, [reset, formState.isSubmitSuccessful])

  const showTokenButton = (tokenButtonNumber: string) => {

    if (tokenButtonNumber === 'first') {
      if (!firstToken) {
        return (_chooseButton('Select', tokenButtonNumber))
      }
      return _chooseButton(firstToken, tokenButtonNumber)
    } else if (tokenButtonNumber === 'second') {
      if (!secondToken) {
        return (_chooseButton('Select', tokenButtonNumber))
      }
      return _chooseButton(secondToken, tokenButtonNumber)
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
      setFirstToken(tokenName)
    } else if (tokenButtonNumber === 'second') {
      setSecondToken(tokenName)
    }
    setVisible(false)

    if(firstTokenAmount && secondTokenAmount) {
      if(firstToken == 'ETH' && secondToken == 'second') {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.AlchemyProvider(connection)

        const signer = provider.getSigner()
        // ubacen odredjen broj eth-a zelimo da vidimo koliko druge valute uzimamo
        let eth_to_token_1_address = '0x000000000'
        let exchange = new ethers.Contract(eth_to_token_1_address, Exchange.abi, signer )
        let transaction = await exchange.getTokenAmount(firstTokenAmount)
        let tx = await transaction.wait()
        setValue('secondTokenAmount', tx.toNumber())
      }
    }



  }

  const handleArrowClick = () => {
    let temp = firstToken
    setFirstToken(secondToken)
    setSecondToken(temp)
    temp = firstTokenAmount

    setValue('firstTokenAmount', secondTokenAmount)
    setValue('secondTokenAmount', temp)
  }



  const checkInputHandler = (e: ChangeEvent<FormElement>) => {
    const value = e.target.value
    const isValid = value.match(/^[+]?([0-9]+\.?[0-9]*|\.[0-9]+)$/)
    if(!isValid || value.length > 15) setValue('firstTokenAmount', value.substring(0,value.length - 1))
    else {
      setValue('firstTokenAmount', value)
    }
  }

  return (
      <div>
        <Spacer y={10} />

        <Container xs  >
          <Button.Group size="xl"  color="gradient" flat>

            <Link href={'/'}><Button><Text color="black">Swap</Text></Button></Link>
            <Link href={'/pool'}><Button><Text color="white">Pool</Text></Button></Link>
          </Button.Group>


          <Card css={{bgColor: "$blue900"}}>
            <Text h1 size={60} css={{
              textGradient: "45deg, $blue500 -20%, $pink500 50%",
              textAlign: "center"
            }}>
              Swap
            </Text>
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
                  />
                </Grid>
                <Grid  lg={3} xs={12} justify='center'>
                  {showTokenButton('first')}
                </Grid>
                <Grid lg={9} justify='center' xs={12}>
                  <button className="text-xs" onClick={() => handleArrowClick()}>
                    <Text className="hover:text-purple-700" color='primary' size={50} >&#8623;</Text>
                  </button>
                </Grid>
                <Grid lg={3} xs={0}/>
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
                  <Button auto type="submit" color='gradient'>Start</Button>
                </Grid>
                {/*<Grid lg={3} xs={0} />*/}
              </Grid.Container>

            </form>

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


            <Modal.Header css={{cursor: 'default'}}>
              <Text id="modal-title" size={18}>
                Choose a currency
              </Text>
            </Modal.Header>
            <Modal.Body css={{cursor: 'default'}}>
              <Text id="modal-description">
              </Text>
                <Button.Group size="xl" vertical color="gradient" flat>
                  <Button onClick={() => chooseToken(lastBtnAccessedModal, 'ETH')}><Text color="white">ETH</Text></Button>
                  <Button onClick={() => chooseToken(lastBtnAccessedModal, 'secondT')}><Text color="white">SecondT</Text></Button>
                  <Button onClick={() => chooseToken(lastBtnAccessedModal, 'thirdT')}> <Text color="white">ThirdT</Text></Button>
                </Button.Group>

            </Modal.Body>
            <Modal.Footer css={{cursor: 'default'}}>
              {/*<Button auto color="error" >*/}
              {/*  Ok*/}
              {/*</Button>*/}
            </Modal.Footer>
          </Modal>

        </Container>
      </div>
  )

}

export default Home
