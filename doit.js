const fs = require('fs').promises;
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const CHART = 'https://unicode.org/emoji/charts/emoji-list.html';

const toEmoji = str => String.fromCodePoint(parseInt(str, 16));

const getEmoji = $elem => toEmoji($elem.find('.code a').attr('name'));

const getImageInfo = ($elem, { slug }) => {
  const src = $elem.find('.andr img').attr('src');
  const [data, base64] = src.split(';base64,');
  const tag = data.split('/').pop();
  const fileName = `${slug}.${tag}`;
  return [fileName, base64];
};

const toSlug = name => name.split(' ').join('-');

const getMeta = $elem => {
  const name = $elem.find('.name').eq(0).text();
  const tags = new Set($elem.find('.name').eq(1).text().split(' | '));
  tags.delete(name);
  return {
    name,
    slug: toSlug(name),
    tags: [...tags],
    emoji: getEmoji($elem),
  };
};

const saveFile = async ([path, data]) =>
  fs.writeFile(`images/${path}`, data, { encoding: 'base64' });

const doit = async () => {
  const response = await fetch(CHART);
  const result = await response.text();

  const $ = cheerio.load(result);

  const all = [];
  const imageInfos = [];

  $('tr').each(function(i, elem) {
    const $this = $(this);
    if ($this.children('td').length) {
      const meta = getMeta($this);
      const imageInfo = getImageInfo($this, meta);
      all.push({
        ...meta,
        imagePath: imageInfo[0],
      });
      imageInfos.push(imageInfo);
    }
  });

  console.log('downloading the files now!');

  await Promise.all(imageInfos.map(saveFile));

  console.log('saving the data!');

  await fs.writeFile('data.json', JSON.stringify(all, null, 2));
};

doit();


