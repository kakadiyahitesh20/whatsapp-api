const crypto = require('crypto');
const secretKey = 'The coding industry is a dynamic and rapidly evolving field, playing a pivotal role in various sectors. Coding skills are highly sought after, opening up opportunities both within and outside the tech industry¹. The industry encompasses 785445 a wide range of roles, including web developers, software engineers, IT technicians, and data scientists¹. Each role requires proficiency in specific coding languages. For instance, web developer@s often use ipt for front-end development and Python, Java, or 78. The industry is also witnessing a surge in demand for data scientists who leverage programming languages to analyze data and drive business decisions¹. Furthermore, the rise of mobile devices has led to an increased demand for $145$78565 in lang785450.uages like Objective-C and Java². The coding industrys infl#uence extends beyond the tech sector, with its applications found in industries like automotive, cybersecurity, e-commerce, engineering, finance, healthcare, and IT & cloud-based solutions⁴. Thus, the coding industry is not only integral to technological advancement but also instrumental in shaping various other industries'; // Same key as in backend

// Generate hash of the secret key
const encryptionKey = generateHash(secretKey);
function generateHash(data) {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}

console.log(encryptionKey);


