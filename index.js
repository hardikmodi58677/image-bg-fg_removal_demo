const { removeBackground,removeForeground,segmentForeground } = require("@imgly/background-removal-node")
const Jimp = require("jimp")
const sharp = require('sharp');

const fs = require("fs")
async function removeBg(ipFileName) {
	try {
		const opFileName = "output_bg_removed.png"
		const fileBlob = await removeBackground(ipFileName)
		const arrayBuffer = await fileBlob.arrayBuffer()
		fs.writeFileSync(opFileName, Buffer.from(arrayBuffer))

    return opFileName
    
	} catch (err) {
		console.error(`Something went wrong in removeBg: ${err.message}`,err)
	}
};


async function removeFg(ipFileName) {
	try {
		let opFileName = "output_fg_removed.png"
		const fileBlob = await removeForeground(ipFileName)
		const arrayBuffer = await fileBlob.arrayBuffer()
		fs.writeFileSync(opFileName, Buffer.from(arrayBuffer))

    const opacity = 0.5
    const image = await Jimp.read(opFileName)
    image.opacity(opacity)

    opFileName = `${opFileName.split(".")[0]}_${opacity}.png`

    return new Promise((resolve,reject) => {
      image.write(opFileName, (err) => {
        if(err) reject(err)
        resolve(opFileName)
      })
    })

	} catch (err) {
		console.error(`Something went wrong in removeFg: ${err.message}`,err)
	}
};

async function combineImages(foregroundImage,backgroundImage) {
  try {
    let opFileName = "output.png"
    return new Promise((resolve,reject) => {
      sharp(backgroundImage).composite([{input: foregroundImage, gravity: 'center' }]).toFile(opFileName, (err, info) => {
        if(err) reject(err)
        resolve(opFileName)
      });
    })
  } catch (error) {
    console.error(`Something went wrong in combineImages: ${error.message}`,error)
  }
}


(async () => {
  const ipFileName = "input.jpeg"
  const [foregroundImage,backgroundImage] = await Promise.all([removeBg(ipFileName),removeFg(ipFileName)])
  const opFileName = await combineImages(foregroundImage,backgroundImage)
  console.info(`Output file: ${opFileName}`)
  fs.readdirSync(__dirname).forEach(file => {
    if(file.endsWith(".png") && !["output.png","input.png"].includes(file)) {
      fs.unlinkSync(file)
    }
  })
})()
