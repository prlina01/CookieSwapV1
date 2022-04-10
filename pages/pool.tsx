import {NextPage} from "next";
import {Button, Container, Spacer, Text, Card, Grid, Input, FormElement, Modal, useModal} from "@nextui-org/react";
import Link from "next/link";
import {ChangeEvent, useEffect, useState} from "react";
import {useForm, useWatch} from "react-hook-form";
import Web3Modal from "web3modal";
import {ethers} from "ethers";
import Token from "../artifacts/contracts/Token.sol/Token.json";
import * as deployedAddresses from '../.config'
import {Factory as FactoryType, Factory__factory, Token__factory} from "../typechain";
import Factory from '../artifacts/contracts/Factory.sol/Factory.json'
import {Token as TokenType} from '../typechain'
import Exchange from '../artifacts/contracts/Exchange.sol/Exchange.json'

const Pool: NextPage = () => {

    const [addLiquidity, setAddLiquidity] = useState<boolean>(false);
    const {control, reset, register, handleSubmit, formState, setValue} = useForm()
    const {setVisible, bindings} = useModal();
    const [tokenName, setTokenName] = useState<string>("")
    const ethAmount = useWatch({control, name: 'ethAmount'})

    const [disableToken, setDisableToken] = useState<boolean>(true);



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

    useEffect(() => {
        reset({
            tokenAmount: '',
            ethAmount: ''
        })
    }, [reset, formState.isSubmitSuccessful])

    const checkInputHandler = (e: ChangeEvent<FormElement>) => {
        const value = e.target.value
        const isValid = value.match(/^[+]?([0-9]+\.?[0-9]*|\.[0-9]+)$/)
        if(!isValid || value.length > 15) setValue('ethAmount', value.substring(0,value.length - 1))
        else {
            setValue('ethAmount', value)
        }
    }
    const chooseToken = async (tokenName: string) => {
        setTokenName(tokenName)
        setVisible(false)

        // input field has not been typed in
        if(!ethAmount) return

        // ubacen odredjen broj eth-a zelimo da vidimo koliko druge valute uzimamo

        const provider = new ethers.providers.AlchemyProvider('rinkeby')

        let tokenAddress
        if(tokenName == tokenSymbols[0]) tokenAddress = deployedAddresses.FIRST_TOKEN
        else tokenAddress = deployedAddresses.SECOND_TOKEN

        let factory = new ethers.Contract(deployedAddresses.FACTORY, Factory.abi, provider)
        let exchangeAddress = await factory.getExchange(tokenAddress)
        let exchange = new ethers.Contract(exchangeAddress, Exchange.abi, provider)
        // console.log(ethers.utils.parseEther(ethAmount))
        let amountOfTokens
        try {
            amountOfTokens = await exchange.getTokenAmount(ethers.utils.parseEther(ethAmount))
        } catch (e) {
            setDisableToken(false)
            return
        }

        setValue('tokenAmount', ethers.utils.parseEther(amountOfTokens))

    }

    const showTokenButton = (tokenName: string) => {
        return(
            <Button auto  color="gradient" onClick={() => setVisible(true)}>
                {tokenName ? tokenName : 'Select'} ∨
            </Button>
        )
    }

        return(
        <div>
            <Spacer y={10} />

            <Container xs  >
                <Button.Group size="xl"  color="gradient">

                    <Link href={'/'}><Button><Text color="white" >Swap</Text></Button></Link>
                    <Link href={'pool'}><Button><Text color="black" >Pool</Text></Button></Link>
                </Button.Group>


                <Card css={{bgColor: "$blue900"}}>
                    {addLiquidity &&
                        <button className="text-xs" onClick={() => setAddLiquidity(!addLiquidity)}>
                            <Text css={{textAlign: "left"}} className="hover:text-purple-700" color='primary' size={50}>&#8592;</Text>
                        </button>
                    }
                    <Text h1 size={60} css={{
                        textGradient: "45deg, $blue500 -20%, $pink500 50%",
                        textAlign: "center"
                    }}>
                        {addLiquidity ? "Add liquidity":"Pool"}
                    </Text>
                    {!addLiquidity ? (
                        <>
                            <Button color="primary" onClick={() => setAddLiquidity(!addLiquidity)}>Add liquidity</Button>
                        </>
                    ) : (
                         <>
                             <form onSubmit={handleSubmit(() => alert('ide gas'))}>
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
                                             {...register('ethAmount', {required: true, maxLength: 15} )}
                                             status="primary"
                                             onChange={(e) => checkInputHandler(e) }
                                         />
                                     </Grid>
                                     <Grid  lg={3} xs={12} justify='center'>
                                         <Button auto  color="gradient" css={{cursor: 'not-allowed'}} >ETH</Button>
                                     </Grid>
                                     <Grid lg={9} justify='center' xs={12}>
                                             <Text color='primary' className="text-xs" size={65} >&#43;</Text>
                                     </Grid>
                                     <Grid  lg={3} xs={12} justify='center'>
                                     </Grid>
                                     <Grid lg={9} xs={12}>
                                         <Input
                                             fullWidth
                                             rounded
                                             bordered
                                             placeholder={tokenName ? "0.00": 'Select a token'}
                                             color="primary"
                                             size="xl"
                                             aria-label="input2"
                                             disabled={disableToken}
                                             {...register('tokenAmount', {required: true})}
                                             status="primary"
                                         />
                                     </Grid>
                                     <Grid  lg={3} xs={12} justify='center'>
                                         {showTokenButton(tokenName)}
                                     </Grid>
                                     <Spacer y={2} />
                                     <Grid lg={12} xs={12} justify='center'>
                                         <Button auto type="submit" color='gradient'>Start</Button>
                                     </Grid>
                                 </Grid.Container>

                             </form>
                         </>
                    )}
                </Card>
            </Container>
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
                        <Button onClick={() => chooseToken(tokenSymbols[0])}><Text color="white">SecondT</Text></Button>
                        <Button onClick={() => chooseToken(tokenSymbols[1])}> <Text color="white">ThirdT</Text></Button>
                    </Button.Group>

                </Modal.Body>
                <Modal.Footer css={{cursor: 'default'}}>
                    {/*<Button auto color="error" >*/}
                    {/*  Ok*/}
                    {/*</Button>*/}
                </Modal.Footer>
            </Modal>

        </div>

    )
}

export default Pool