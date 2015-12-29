/**
 * DATA CLEANUP
 *
 * Original data downloaded from here: https://www.gov.uk/government/publications/new-years-honours-list-2015
 *
 * Converted into JSON and saved as "original-data.json".
 *
 * This script is for cleaning it up. The cleaned up results are put on Google Spreadsheets here, and can then be hand-edited:
 *
 * https://docs.google.com/spreadsheets/d/1XGqZlMT43O2XIGaWY7ZlSKbyA2RyBz5PDfL7gZydsdY/edit#gid=1278905282
 */

import sander from 'sander';
import Immutable from 'immutable';
import 'loud-rejection/register';

import list from './original-data.json';

const customNames = {
  'Ms Emma Catherine Ramsay WILLIS (MRS CORFIELD)': {
    forenames: 'Ms Emma Catherine Ramsay',
    surname: 'Willis (Mrs Corfield)'
  },
  'Rt Hon Lord David Ivor YOUNG OF GRAFFHAM DL': {
    forenames: 'Rt Hon Lord David Ivor',
    surname: 'Young of Graffham',
    suffixes: 'DL'
  },
  'Professor Julian Ernest Michael LE GRAND FBA': {
    forenames: 'Professor Julian Ernest Michael',
    surname: 'Le Grand',
    suffixes: 'FBA'
  },
  'Ms Barbara Mary PLUNKET GREENE OBE': {
    forenames: 'Ms Barbara Mary',
    surname: 'Plunket Greene',
    suffixes: 'OBE'
  },
  'Ms Kristin SCOTT THOMAS OBE': {
    forenames: 'Ms Kristin',
    surname: 'Scott Thomas',
    suffixes: 'OBE'
  },
  'Mr Philip Richard WOOD QC (HON)': {
    forenames: 'Mr Philip Richard',
    surname: 'Wood',
    suffixes: 'QC (HON)'
  },
  'Dr Anna Danielle VAN DER GAAG': {
    forenames: 'Dr Anna Danielle',
    surname: 'van der Gaag',
  },
  'Mr Andrew DE FREITAS': {
    forenames: 'Mr Andrew',
    surname: 'De Freitas',
  },
  'Countess Carolyn Mary DE SALIS': {
    forenames: 'Countess Carolyn Mary',
    surname: 'de Salis',
  },
  'Mrs Sonja LE VAY': {
    forenames: 'Mrs Sonja',
    surname: 'Le Vay',
  },
  'Mrs Lydia Helena LOPES CARDOZO': {
    forenames: 'Mrs Lydia Helena',
    surname: 'Lopes Cardozo',
  },
  'Mr Andrew LORRAIN SMITH': {
    forenames: 'Mr Andrew',
    surname: 'Lorrain Smith',
  },
  'Mrs Isabel DE PELET': {
    forenames: 'Mrs Isabel',
    surname: 'de Pelet',
  },
  'Mrs Angela Catherine WARNEKEN GOLD': {
    forenames: 'Mrs Angela Catherine',
    surname: 'Warneken Gold',
  },
  'Dr Mich\u00E8le DIX': {
    forenames: 'Dr Mich\u00E8le',
    surname: 'Dix',
  },
};

const customGenders = {
  'Rt Hon Lord Jeremy John Durham': 'M',
  'Rt Hon Lord David Ivor': 'M',
  'Professor Richard Robert': 'M',
  'Professor (Andrew) Jonathan': 'M',
  'Dr Simon Fraser': 'M',
  'Dr Anthony Herbert': 'M',
  'Professor Julian Ernest Michael': 'M',
  'Professor Martyn': 'M',
  'Professor Nilesh Jayantilal': 'M',
  'Professor Nigel John': 'M',
  'Professor Norman Stanley': 'M',
  'Dr Andrew John': 'M',
  'Professor Christopher John MacRae': 'M',
  'Professor Sir John Irving': 'M',
  'Professor Carol Ann': 'F',
  'Rt Hon Anne Catherine': 'F',
  'Professor Teresa Lesley': 'F',
  'Professor Eileen': 'F',
  'Professor Marina Sarah': 'F',
  'Professor Graeme William Walter': 'M',
  'Professor Alistair Stanyer': 'M',
  'Dr Michèle': 'F',
  'Professor Ruth Sarah': 'F',
  'Professor Russell': 'M',
  'Rt Hon (John) Michael': 'M',
  'Professor Heather Evelyn': 'F',
  'Councillor Erica': 'F',
  'Dr Ruth Jane': 'F',
  'Carolyn': 'F',
  'Dr Alice Mary': 'F',
  'Dr Bridget Mary': 'F',
  'Professor Julienne Elizabeth': 'F',
  'Professor Timothy Noel': 'M',
  'Professor Sharon Jayne': 'F',
  'Professor David Anthony': 'M',
  'Professor Peter Wynne': 'M',
  'Professor Stephen Michael': 'M',
  'Dr (Vivecca) Vicky': 'F',
  'Professor Fiona Mary': 'F',
  'Professor Caroline': 'F',
  'Professor Rosalind Louise': 'F',
  'Dr Anna Danielle': 'F',
  'Professor Paul': 'M',
  'Professor Caroline Elizabeth': 'M',
  'Professor Bill': 'M',
  'Dr Mohinder Singh': 'M',
  'Professor Diane Joan': 'M',
  'Dr Helen': 'F',
  'Professor Peter Riven': 'M',
  'Professor Margaret Louise': 'F',
  'Professor Stewart': 'M',
  'Dr Sarah': 'F',
  'Dr Hilary Dawn': 'F',
  'Colonel Edward Paul Ronald': 'M',
  'Lt Col (Retd) Jerome Wilfrid': 'M',
  'Dr Beverly Jane': 'F',
  'Dr David Gordon': 'M',
  'Professor Cyrus': 'M',
  'Judge John Joseph': 'M',
  'Dr Lesley Sharon': 'F',
  // 'Professor Paul': 'M',
  'Dr John Damien': 'M',
  'Dr Bernadette': 'F',
  'Colonel Robin Dewhurst': 'M',
  'Dr George Thompson': 'M',
  'Dr Robert': 'M',
  'Professor Geoffrey': 'M',
  'Dr Jacqui Lunday': 'F',
  'Dr Glynn': 'M',
  'Dr William': 'M',
  'Dr Roshan': 'M',
  'Dr Graeme Peter Alexander': 'M',
  'Dr Ruth Louise': 'F',
  'Professor Robert Hamilton': 'M',
  'Professor Ian Mark': 'M',
  'Dr Anne Philomena': 'F',
  'Professor Venugopal Karunakaran': 'M',
  'Professor Dilip': 'M',
  'Gwen': 'F',
  'Dr David Alasdair Hamley': 'M',
  'Dr Timothy William': 'M',
  'Lt Col Peter Albert': 'M',
  'Dr John William': 'M',
  'Professor Kenneth Richard': 'M',
  'Dr John Anthony': 'M',
  'Professor Iram': 'M',
  'Professor Nigel James': 'M',
  'Professor Sarah Katherine': 'F',
  'Professor Gwyneth Mary': 'F',
  'Lady Jean Roberta': 'F',
  'Professor Valerie': 'F',
  'Professor Christopher Allan': 'M',
  'Professor Hugh Godfrey Maturin': 'M',
  'Colonel Edward Christopher': 'M',
  'Councillor Elizabeth': 'F',
  'Alderman William Alexander Fraser': 'M',
  'Professor Uduak': 'F',
  'Dr Pamela Oriri Scholastica': 'F',
  'Professor Elizabeth Margaret': 'F',
  'Dr Robert Dean Joseph': 'M',
  'Dr David': 'M',
  'Dr Alan': 'M',
  'Pastor Gbolahan Ayorinde': 'M',
  'Councillor Janet': 'F',
  'Professor Janatha Hetherington': 'F',
  'Dr Colin Deas': 'M',
  'Dr Audrey Elizabeth Arlene': 'F',
  'Professor Quintin Ivor': 'M',
  'Dr Gillian': 'F',
  'Dr Robert Anthony': 'M',
  'Dr Heather Mary': 'F',
  'Councillor Carole Maxwell': 'F',
  'Professor Barbara Ann': 'F',
  'Dr Mary Patricia': 'F',
  'Captain Hugh Francis Joseph': 'M',
  'Professor Jennifer Elizabeth': 'F',
  'Professor Patrick': 'M',
  'Dr Kate Miriam': 'F',
  'Professor Susan': 'F',
  'Dr Barbara': 'F',
  'Professor Martin Anthony': 'M',
  'Professor Katharine': 'F',
  'Rev Dr Richard Leslie': 'M',
  'Professor Peter Kenneth': 'M',
  'Professor Elisabeth Ann': 'F',
  'Dr Stefan Maria Josef Stanislaus': 'F',
  'Dr Kenneth David': 'M',
  'Dr Michael John': 'M',
  'Dr Brian Douglas': 'M',
  'Dr Paul': 'M',
  'Dr Jean': 'F',
  'Lt Col David Edward': 'M',
  'Dr Rosaleen Mary': 'F',
  'Professor Carole Margaret': 'F',
  'Rabbi Barry': 'M',
  'The Reverend Ronald': 'M',
  'Councillor John': 'M',
  'Alderman Maurice Turtle': 'M',
  'Dr Patrick Alfred': 'M',
  'Dr Caron': 'F',
  'Professor Nanette': 'F',
  'Dr Alastair Lockington': 'M',
  'Dr Stephen Roger': 'M',
  'Councillor Francis': 'M',
  'Gail': 'F',
  'Professor Richard Thomas': 'M',
  'Professor John Joseph': 'M',
  'Dr Jay': 'F',
  'Dr Wendy Barbara': 'F',
  'Dr David Farquharson': 'M',
  'Dr Michael Vaughan': 'M',
  'Dr Jane Rata': 'F',
  'Councillor James Gregory': 'M',
  'Dr Leslie': 'M',
  'Dr Elizabeth Anne': 'F',
  'Councillor Josephine Mary': 'F',
  'Dr William Huw John': 'M',
  'Councillor Martha Glenys Dianne': 'F',
  'The Reverend Susan Mary': 'F',
  'Dr Shazad': 'M',
  'Dr Arthur James': 'M',
};

// sander.readFile(__dirname, 'original-data.json')
  // .then(contents => JSON.parse(contents.toString('utf8')))
Promise.resolve(list)
  .then(list => {
    const types = {};

    let honours = Immutable.fromJS(list).map(item => item
      // remove bits we don't need
      .remove('Year')
      .remove('Honours List')
      .remove('Order')
      .remove('Award')
      // grab all the award levels into a separate place
      .map((value, key) => {
        if (key === 'Level' && !types[value]) {
          types[value] = {
            award: item.get('Award'),
            order: item.get('Order'),
          };
        }

        return value;
      })
      // remove excess whitespace from every value
      .map(value => value.trim().replace(/\s+/g, ' '))
      .flip()
        // lowercase all the keys
        .map(x => x.toLowerCase())
        // rename "level" to "honour" (the abbreviation)
        .map(x => x === 'level' ? 'honour' : x)
      .flip()
    );

    // now fix all the names and try to add gender
    const foundSuffixes = new Set();
    // const ungenderedTitles = new Set();
    honours = honours.map(item => {
      const name = item.get('name');

      let forenames;
      let surname;
      let suffixes;

      if (customNames[name]) {
        ({forenames, surname, suffixes} = customNames[name]);
      } else {
        // automatic...
        const words = name.split(' ');
        const upperCaseFinalWords = [];

        while (isUpperCase(words[words.length - 1])) {
          upperCaseFinalWords.unshift(words.pop());
        }

        forenames = words.join(' ');

        // console.log('NAMES...');
        // console.log('  pre: ', words.join(' '));
        // console.log('  end: ', upperCaseFinalWords.join(' '));

        if (!upperCaseFinalWords.length) {
          throw new Error('unexpected: ' + name);
        }
        if (upperCaseFinalWords.length > 1) {
          upperCaseFinalWords.slice(1).forEach(w => foundSuffixes.add(w));
        }

        ([surname, ...suffixes] = upperCaseFinalWords);

        suffixes = suffixes.map(suffix => {
          if (suffix === 'FRENG') return 'FREng';
          return suffix;
        }).join(' ') || undefined;

        // if (surname.startsWith('DE') || surname.startsWith('LE')) {
        //   console.warn('WARNING SURNAME:', name);
        // }

        if (surname.startsWith('MC')) {
          surname = 'Mc' + capFirst(surname.substring(2));
        } else if (surname.includes('-')) {
          surname = surname.split('-').map(capFirst).join('-');
        } else surname = capFirst(surname);
      }

      // add gender
      let gender;
      let guessedGender;
      {
        const title = forenames.split(' ')[0];
        switch (title) {
        case 'Mr':
        case 'Sir':
        case 'His':
          gender = 'M';
          break;
        case 'Mrs':
        case 'Ms':
        case 'Miss':
        case 'Dame':
        case 'Countess':
          gender = 'F';
          break;
        default:
          // ungenderedTitles.add(title);
          // console.log('GENDER?', forenames);
          gender = customGenders[forenames];
          guessedGender = '1';
        }
      }

      if (!gender) throw new Error('gender not found for', name);

      return item.merge({
        forenames, surname, suffixes, gender, guessedGender
      });
    });
    console.log('FOUND SUFFIXES', foundSuffixes);
    // console.log('UNGENDERED TITLES', ungenderedTitles);

    return {
      types: Object.keys(types).map(abbr => ({abbr, award: types[abbr].award, order: types[abbr].order})),
      honours
    };
  })
  .then(({types, honours}) => Promise.all([
    sander.writeFile(__dirname, 'honours.json', new Buffer(
      JSON.stringify(honours, null, 2), 'utf8'
    )),
    sander.writeFile(__dirname, 'types.json', new Buffer(
      JSON.stringify(types, null, 2), 'utf8'
    )),
  ]))
;

function isUpperCase(str) {
  return str.toUpperCase() === str;
}

function capFirst(str) {
  return str[0].toUpperCase() + str.substring(1).toLowerCase();
}
