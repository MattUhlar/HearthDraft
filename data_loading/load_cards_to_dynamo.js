"use strict";

import Amplify, { API, graphqlOperation } from "aws-amplify";
import _ from "underscore";
import fs from "fs";

import aws_config from "../src/aws-exports";
import * as mutations from '../src/graphql/mutations';

Amplify.configure(aws_config);
Amplify.configure({
  API: {
    graphql_endpoint: "ENDPOINT_GOES_HERE",
    graphql_endpoint_iam_region: "REGION_GOES_HERE"
  }
});

const writeCardToGraphQL = (card) => {
	Amplify.API.graphql(graphqlOperation(mutations.createCard, {input: card}))
	.then(data => {})
	.catch(err => console.log(err));
}

const stringifyAttribute = (card, attribute) => {
	if (_.has(card, attribute)) {
		card[attribute] = JSON.stringify(card[attribute]);
	}

	return card;
}


fs.readFile('cards.collectible.json', 'utf-8', (err, contents) => {
	contents = JSON.parse(contents.trim());

	const x = _.chain(contents)
		.filter(card => card.type !== 'HERO')
		.map(card => _.extend(card, {'cardId': card.id}))
		.map(card => _.omit(card, 'id'))
		.map(card => stringifyAttribute(card, 'playRequirements'))
		.groupBy(card => card.cardClass)
		.()

	console.log(_.keys(x));

	/*
	_.chain(contents)
		.filter(card => card.type !== 'HERO')
		.map(card => _.extend(card, {'cardId': card.id}))
		.map(card => _.omit(card, 'id'))
		.map(card => stringifyAttribute(card, 'playRequirements'))
		.each(card => writeCardToGraphQL(card));
		*/
});

