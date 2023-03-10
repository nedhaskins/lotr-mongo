import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';

import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

import cors from 'cors';

const app = express();

//Used to parse URL-encoded bodies
app.use(express.urlencoded ({ extended: true }) );

//Used to parse JSON-encoded bodies
app.use(express.json());

app.use(cors());


const { MONGOUSER, MONGOPASSWORD, MONGOHOST, MONGOPORT } = process.env;

async function connectToMongo() {
	const endpoint = 

	//Cloud instance of MongoDB 
	// `mongodb+srv://nedtheadmin:${process.env.PASSWORD}@my-new-cluster.u7spzrw.mongodb.net/test`;
	
	//Local machine instance of MongoDB
	//'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.1';

	//Railway MongoDB instances - data will be stored here
	`mongodb://${MONGOUSER}:${MONGOPASSWORD}@${MONGOHOST}:${MONGOPORT}`;

	await mongoose.connect(endpoint);
}

//if environment = local {
	//go here, or assign some variable to route
//} elseif environment = cloud1



//if at any time there's an error...run this
connectToMongo()
	.catch(function(err){
		console.log(err)
	});


//Order is important here!  First the schema definition, then the model.
const lotrSchema = new mongoose.Schema({
	name: String,
	type: String,
	description: String
})

const Character = mongoose.model('Character', lotrSchema);


//Setting the following function to 'async' allows for the await keyword.
app.get('/', function(request, response) {

	const form = `
		<form action='/add' method='POST'>
			<label>Name</label>
			<input type='text' name='name' />
			<label>Type</label>
			<input type='text' name='type' />
			<button type='submit'>Submit</button>
		</form>
	`;

	response.send(form);
})





//Commands for a read request.
app.get('/characters', async function(request, response) {
	const characters = await Character.find();
	console.log('test', characters);

	var template = `<h1>List</h1><ul>`;

	characters.forEach( function(character) {
		template += `
			<li>Name: ${character.name} Type: ${character.type}
				<a href='/update/${character.name}'>Update</a>
				<a href='/delete/${character.name}'>Delete</a>
			</li>`;
	})

	template += `</ul><a href='/'>Add a character</a>`;
	response.send(template);
})


app.post('/add', async function(request, response) {
	const character = new Character( request.body ); //why does request.params not work here?
	await character.save();
	console.log(character);
	response.redirect('/characters');
})










//Returns the form for updating an existing record.
app.get('/update/:name', async function(request, response) {

	const character = await Character.findOne({name: request.params.name}).exec();
	console.log(character.name);
	const form = `
		<form action='/update/${request.params.name}' method='POST'>
			<label>Name</label>
			<input type='text' name='name' value='${character.name}' />
			<label>Type</label>
			<input type='text' name='type' value='${character.type}'/>
			<button type='submit'>Submit</button>
		</form>
	`;
	response.send(`<h1>Update: ${request.params.name}</h1>${form}`)
})


app.post('/update/:name', async function(request, response) {
	const res = await Character.updateOne( 
		{name: request.params.name}, request.body
	);
	if(res.acknowledged) {
		console.log( "Record was updated." )
	};
	response.redirect('/characters');
})




app.get('/delete/:name', async function(request, response) {
	await Character.deleteOne( {name: request.params.name} );


	response.send(`<h1>Deleted: ${request.params.name}</h1>
		<a href='/characters'>Character list</a>`)

})



app.get('/api/characters', async function(request, response) {
	const characters = await Character.find();
	console.log(characters);
	response.send(characters);
})


 

//this is set up this way for the Railway deployment
app.listen(process.env.PORT, function () {
	console.log("Listening to the active port.");
});