const config = require('./config')
const mongoose = require('mongoose')
const { Schema } = mongoose

mongoose.connect(config.dbUri)

const schemaOptions = {
	toObject: {virtuals: true},
	toJSON: {virtuals: true},
}

let settingsSchema = new Schema({
	key: {
		type: String,
		unique: true
	},
	value: Schema.Types.Mixed
})
settingsSchema.pre('save', async function() {
	this.markModified('value')
})

// Each position gets its own Position
let positionSchema = new Schema({
	school: { type: Schema.Types.ObjectId, ref: 'School' },
	name: String,
	rubrics: [{
		name: String,
		descriptions: [ String ]
	}]
}, schemaOptions)
// define backwards relationship
positionSchema.virtual('nominations', {
	ref: 'Nomination',
	localField: '_id',
	foreignField: 'position'
})

// Store every nomination here
let nominationSchema = new Schema({
	position: { type: Schema.Types.ObjectId, ref: 'Position' },
	nominee: { type: Schema.Types.ObjectId, ref: 'Teacher' },
	nominator: { type: Schema.Types.ObjectId, ref: 'Teacher' },
	ratings: [ Number ],
	reason: String,
	approved: {
		type: Boolean,
		default: undefined
	}
})

// Store school details - name and critera,
let schoolSchema = new Schema({
	name: String,
}, schemaOptions)
schoolSchema.virtual('teachers', {
	ref: 'Teacher',
	localField: '_id',
	foreignField: 'school'
})
schoolSchema.virtual('positions', {
	ref: 'Position',
	localField: '_id',
	foreignField: 'school'
})

// This is the teachers schema
// Holds teacher details and pin
let teacherSchema = new Schema({
	name: String,
	pin: String,
	used: {
		type: Boolean,
		default: false
	},
	school: { type: Schema.Types.ObjectId, ref: 'School' }
}, schemaOptions)

module.exports = {
	School: mongoose.model('School', schoolSchema),
	Position: mongoose.model('Position', positionSchema),
	Nomination: mongoose.model('Nomination', nominationSchema),
	Teacher: mongoose.model('Teacher', teacherSchema),

	Settings: mongoose.model('Settings', settingsSchema)
}