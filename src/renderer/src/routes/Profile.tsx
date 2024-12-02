import React from 'react'
import { Button, Container, Stack, TextField } from '@mui/material'
import { Calls } from '../calls/calls'
import RouteWrapper from '../components/RouteWrapper'

function Profile(): React.ReactNode {
  const [athlete, setAthlete] = React.useState<Partial<Athlete>>({})
  const [id, setId] = React.useState('')
  const [name, setName] = React.useState('')

  function handleIdChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setId(event.target.value)
  }

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setName(event.target.value)
  }

  async function handleCreate(): Promise<void> {
    if (!id || !name) return
    const athlete = await Calls.Athlete.create({
      _id: id,
      username: name
    })
    setAthlete(athlete)
  }

  async function handleGet(): Promise<void> {
    if (!id) return
    const athlete = await Calls.Athlete.get(id)
    setAthlete(athlete)
  }

  async function handleList(): Promise<void> {
    const athletes = await Calls.Athlete.list()
    console.log(athletes)
  }

  return (
    <RouteWrapper>
      <Container>
        <Stack spacing={2}>
          <TextField label={'Id'} name={'id'} onChange={handleIdChange} value={id} />
          <TextField label={'Jméno'} name={'name'} onChange={handleNameChange} value={name} />

          <br />

          <Button onClick={handleCreate}>Submit</Button>

          <Button onClick={handleGet}>Get</Button>

          <Button onClick={handleList}>List</Button>

          <pre>{JSON.stringify(athlete, null, 2)}</pre>
        </Stack>
      </Container>
    </RouteWrapper>
  )
}
export default Profile
