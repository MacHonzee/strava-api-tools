// eslint-disable-next-line
// async function saveKitten() {
//   await window.api.db.put({
//     _id: 'mittens',
//     name: 'Mittens',
//     occupation: 'kitten',
//     age: 3,
//     hobbies: ['playing with yarn', 'chasing laser pointers']
//   })
// }

// eslint-disable-next-line
async function getKitten() {
  const kitten = await window.api.db.get('mittens')
  console.log('Kitten:', kitten)
}

export async function ModelSetup(): Promise<void> {
  // await saveKitten()
  await getKitten()
  await getKitten()
  await getKitten()
  await getKitten()
  await getKitten()
}
