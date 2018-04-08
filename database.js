const config = require('./config')
const mongoose = require('mongoose')
const { Schema } = mongoose


mongoose.connect(config.dbUri)

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

// Store school details - name and critera,
let schoolSchema = new Schema({
	name: String,
	critera: [{
		name: String,
		rubrics: [{
			name: String,
			descriptions: [ String ]
		}]
	}]
})
schoolSchema.virtual('teachers', {
	ref: 'Teacher',
	localField: '_id',
	foreignField: 'school'
})
schoolSchema.set('toObject', { virtuals: true });
schoolSchema.set('toJSON', { virtuals: true });

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
})

module.exports = {
	School: mongoose.model('School', schoolSchema),
	Teacher: mongoose.model('Teacher', teacherSchema),

	Settings: mongoose.model('Settings', settingsSchema)
}