import {NextPage} from "next";
import {
    Button,
    Container,
    Spacer,
    Text,
    Card,
    Grid,
    Input,
    FormElement,
    Modal,
    useModal,
    Collapse
} from "@nextui-org/react";
import Link from "next/link";
import {ChangeEvent, useEffect, useState} from "react";
import {useForm, useWatch} from "react-hook-form";
import Web3Modal from "web3modal";
import {ethers} from "ethers";
import Token from "../artifacts/contracts/Token.sol/Token.json";
import * as deployedAddresses from '../.config'
import Factory from '../artifacts/contracts/Factory.sol/Factory.json'
import Exchange from '../artifacts/contracts/Exchange.sol/Exchange.json'
import {useRouter} from "next/router";
import UserAddedLiquidity from "../components/UserAddedLiquidity";

const Pool: NextPage = () => {

    const [addLiquidity, setAddLiquidity] = useState<boolean>(false);
    const {control, reset, register, handleSubmit, formState, setValue} = useForm()
    const {setVisible, bindings} = useModal();
    const [tokenName, setTokenName] = useState<string>("")
    const ethAmount = useWatch({control, name: 'ethAmount'})

    const [disableToken, setDisableToken] = useState<boolean>(true);
    const router = useRouter();

    const [isWaiting, setIsWaiting] = useState<boolean>(false);
    const [alertMsg, setAlertMsg] = useState<string>("")

    const [tokenSymbols, setTokenSymbols] = useState<string[]>([])

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)

    // const [userLiquidityPools, setUserLiquidityPools] = useState([])


    useEffect(() => {
        const setSymbols = async () => {
            if(typeof window.ethereum != "undefined")
            window.ethereum.selectedAddress ? setIsLoggedIn(true) : setIsLoggedIn(false)
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
        // void showUserLiquidityHandler()
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
    const chooseToken = async (_tokenName: string) => {
        setTokenName(_tokenName)
        setValue('tokenAmount', "")
        setVisible(false)

        // input field has not been typed in
        if(!ethAmount) return

        const exchange = await _getExchangeFromTokenName(false, _tokenName)

        let amountOfTokens

        try {
            let parsedEther = ethers.utils.parseEther(ethAmount)
            amountOfTokens = await exchange.getTokenAmountWhenAddingLiquidity(parsedEther)
        } catch (e) {
            setDisableToken(false)
            return
        }

        setValue('tokenAmount', ethers.utils.formatEther(amountOfTokens))
        setDisableToken(true)
    }

    const calculateTokenHandler = async () => {
        // token has not been selected
        if(!tokenName) return
        // 0 eth has been inputted
        if(!ethAmount) {
            setValue('tokenAmount', '')
            return
        }

        setValue('tokenAmount', "")
        const exchange = await _getExchangeFromTokenName(false, tokenName)

        let amountOfTokens

        try {
            let parsedEther = ethers.utils.parseEther(ethAmount)
            amountOfTokens = await exchange.getTokenAmountWhenAddingLiquidity(parsedEther)
        } catch (e) {
            setDisableToken(false)
            return
        }

        setValue('tokenAmount', ethers.utils.formatEther(amountOfTokens))
        setDisableToken(true)

    }

    const _getExchangeFromTokenName = async (isChangingLiquidity: boolean, tokenName: string) => {
        let provider
        let signer
        let tokenAddress
        let exchange
        if(tokenName == tokenSymbols[0]) tokenAddress = deployedAddresses.FIRST_TOKEN
        else tokenAddress = deployedAddresses.SECOND_TOKEN

        if(isChangingLiquidity) {
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

    const showTokenButton = (tokenName: string) => {
        return(
            <Button auto  color="gradient" onClick={() => setVisible(true)}>
                {tokenName ? tokenName : 'Select'} ∨
            </Button>
        )
    }

    const addLiquidityHandler = async (item: any) => {
        let {ethAmount, tokenAmount} = item

        if (typeof window.ethereum == "undefined") {
            setVisible(true)
            setAlertMsg(`Metamask is not installed in your browser!`)
            return
        }

        const exchange = await _getExchangeFromTokenName(true, tokenName)

        let tokenAddress
        if(tokenName == tokenSymbols[0]) tokenAddress = deployedAddresses.FIRST_TOKEN
        else tokenAddress = deployedAddresses.SECOND_TOKEN

        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        let provider = new ethers.providers.Web3Provider(connection)
        let signer = provider.getSigner()
        let token = new ethers.Contract(tokenAddress, Token.abi, signer)

        let currentEthBalance = ethers.utils.formatEther(await signer.getBalance())
        let currentTokenBalance = ethers.utils.formatEther(await token.balanceOf(await signer.getAddress()))
        let firstCondition = parseInt(currentTokenBalance) < parseInt(tokenAmount)
        let secondCondition = parseInt(currentEthBalance) < parseInt(ethAmount)
        if(secondCondition) {
            setVisible(true)
            setAlertMsg(`Not enough ETH`)
            return
        } else if(firstCondition) {
            setVisible(true)
            setAlertMsg(`Not enough ${tokenName}!`)
            return
        }
        let tx = await token.approve(exchange.address, ethers.utils.parseEther(tokenAmount))
        setIsWaiting(true)
        await tx.wait()
        let transaction = await exchange.addLiquidity(ethers.utils.parseEther(tokenAmount), {value: ethers.utils.parseEther(ethAmount)})
        await transaction.wait()
        setIsWaiting(false)
        setTokenName('')
        setVisible(true)
        setAlertMsg('Successfully added liquidity!')

    }

    // ---------------------------------------------------------------

    const loginHandle = async () => {
        if (typeof window.ethereum !== 'undefined') {
            // console.log(window.ethereum.selectedAddress)
            const web3Modal = new Web3Modal()
            await web3Modal.connect()
            if(window.ethereum.selectedAddress) setIsLoggedIn(true)
            setVisible(true)
            setAlertMsg('Successfully logged in!')

        } else {
            setVisible(true)
            setAlertMsg("Metamask is not installed in your browser")
        }

    }

    const removeLiquidityHandler = async (liquidityPool: any) => {

        const exchange = await _getExchangeFromTokenName(true, tokenName)
        const tx = await exchange.removeLiquidity(ethers.utils.parseEther(liquidityPool['lpTokenAmount']))
        setIsWaiting(true)
        await tx.wait()
        setIsWaiting(false)
        setVisible(true)
        setAlertMsg('Successfully removed liquidity')
        await router.push('/')
    }

        return(
        <div>
            <Spacer y={5} />

            <Container xs  >
                {!isWaiting && (
                    <Button.Group size="xl"  color="gradient">
                        <Link href={'/'}><Button><Text color="white" >Swap</Text></Button></Link>
                        <Link href={'pool'}><Button><Text color="black" >Pool</Text></Button></Link>
                    </Button.Group>
                )}
                <Card css={{bgColor: "$blue900"}}>
                    {addLiquidity && !isWaiting &&
                        <button className="text-xs" onClick={() => setAddLiquidity(!addLiquidity)}>
                            <Text css={{textAlign: "left"}} className="hover:text-purple-700" color='primary' size={50}>&#8592;</Text>
                        </button>
                    }
                    <Text h1 size={60} css={{
                        textGradient: "45deg, $blue500 -20%, $pink500 50%",
                        textAlign: "center"
                    }}>
                        {isWaiting ? "Waiting for transactions..." : (addLiquidity ? "Add liquidity":"My liquidity")}
                    </Text>
                    {!addLiquidity && !isWaiting ? (
                        <>
                            { !isLoggedIn ? (
                                <Button.Group ghost css={{mt: '15%', '@lg': {ml: '25%'}}} size="xl" color="primary">
                                    <Button color="primary" onClick={() => loginHandle()}>Login</Button>
                                    <Button  color="primary" onClick={() => setAddLiquidity(!addLiquidity)}>
                                        Add liquidity
                                    </Button>
                                </Button.Group>
                            ) : (
                                <>
                                   <Card hoverable color="gradient" css={{mb: '15%', mt: '5%'}}>
                                       <Text color="white">
                                           Liquidity providers <b>earn a 1% fee</b> on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
                                       </Text>
                                   </Card>

                                    <Grid.Container gap={1}>
                                        <UserAddedLiquidity
                                            _getExchangeFromTokenName={_getExchangeFromTokenName}
                                            removeLiquidityHandler={removeLiquidityHandler}
                                        />
                                    </Grid.Container>

                                    <Button ghost css={{mt: '30px', mx: '15%'}} color="primary" onClick={() => setAddLiquidity(!addLiquidity)}>
                                        Add liquidity
                                    </Button>
                                </>
                            )}
                        </>
                    ) : (
                         <> {!isWaiting && (
                             <form onSubmit={handleSubmit(addLiquidityHandler)}>
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
                                             onBlur={() => calculateTokenHandler()}
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
                         )}
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

                {!alertMsg ? (
                    <>
                        <Modal.Header css={{cursor: 'default'}}>
                            <Text id="modal-title" size={18}>
                                Choose a currency
                            </Text>
                        </Modal.Header>
                        <Modal.Body css={{cursor: 'default'}}>
                            <Text id="modal-description">
                            </Text>
                            <Button.Group size="xl" vertical color="gradient" flat>
                                <Button onClick={() => chooseToken(tokenSymbols[0])}><Text color="white">{tokenSymbols[0]}</Text></Button>
                                <Button onClick={() => chooseToken(tokenSymbols[1])}> <Text color="white">{tokenSymbols[1]}</Text></Button>
                            </Button.Group>

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
                                {alertMsg}
                            </Text>
                        </Modal.Header>
                        <Modal.Body css={{cursor: 'default'}}>
                            <Button onClick={() => {
                                setVisible(false)
                                setAlertMsg("")
                            }}  color="error" >
                              Ok
                            </Button>
                        </Modal.Body>
                    </>
                )}
            </Modal>

        </div>

    )
}

export default Pool