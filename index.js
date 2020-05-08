'use strict';
const alfy = require('alfy');
const Fuse = require('fuse.js');

const data = require('./data.json');

const options = {
	keys: ['name', 'tags'],
};

const fuse = new Fuse(data, options);

const mapResult = ({ name, imagePath, emoji, slug }) => ({
	title: name,
	uuid: slug,
	icon: {
		path: `./images/${imagePath}`,
	},
	arg: emoji,
});

alfy.output(
	fuse.search(alfy.input).map(
		({ item }) => mapResult(item),
	)
);
