import type { NextPage } from 'next'
import {ethers} from "ethers";
import { useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import Link from 'next/link'
import Web3Modal from 'web3modal'
import { Input, Container, Row, Col, Spacer, Card, Text, Button, Modal, useModal, Loading, Radio, Grid } from "@nextui-org/react";



const Home: NextPage = () => {

  const handleSwap = async () => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()

  }
  const { setVisible, bindings } = useModal();
  const [firstToken, setFirstToken] = useState<string>()
  const [secondToken, setSecondToken] = useState<string>();

  const {reset, register, handleSubmit, formState} = useForm()


  useEffect(() => {
    reset({
      greetInputField: ''
    })
  }, [reset, formState.isSubmitSuccessful])

  const showButton = () => {
    if(!firstToken) {return (<Button auto shadow color="gradient" onClick={() => setVisible(true)} >ETH ∨</Button>)}
    else if (firstToken === "ETH") {return (<Button size={'xs'}></Button>)}
  }

  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  return (
      <div>
        <Spacer y={10} />
        <Container xs  >
          <Card css={{bgColor: "$blue900"}}>
            <Text h1 size={60} css={{
              textGradient: "45deg, $blue500 -20%, $pink500 50%",
              textAlign: "center"
            }}>
              Swap
            </Text>
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
                />
              </Grid>
              <Grid  lg={3} xs={12} justify='center'>
                {showButton()}
              </Grid>
              <Grid lg={9} justify='center' xs={12}>
                <button className="text-xs"><Text color='primary' size={50} >&#8623;</Text></button>
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
                />
              </Grid>
              <Grid lg={3} xs={12} justify='center'>
                {showButton()}
              </Grid>
              <Spacer y={2} />
              <Grid lg={12} xs={12} justify='center'>
                <Button auto color='gradient'>Start</Button>
              </Grid>
              {/*<Grid lg={3} xs={0} />*/}
            </Grid.Container>

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
                  <Button onClick={() => setVisible(false)}>ETH</Button>
                  <Button onClick={() => setVisible(false)}>Drugi</Button>
                  <Button onClick={() => setVisible(false)}> Treci</Button>
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
