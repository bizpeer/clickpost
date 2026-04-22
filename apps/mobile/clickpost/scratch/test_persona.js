const { PersonaEngine } = require('../services/avatar/PersonaEngine');

function testPersona() {
  const testUsers = [
    {
      name: '김철수',
      birthDate: new Date('1995-05-15'),
      gender: 'MALE',
      countryCode: 'KR'
    },
    {
      name: 'Nguyen An',
      birthDate: new Date('2005-08-20'),
      gender: 'FEMALE',
      countryCode: 'VN'
    },
    {
      name: 'John Doe',
      birthDate: new Date('1975-12-01'),
      gender: 'MALE',
      countryCode: 'US'
    }
  ];

  testUsers.forEach(user => {
    console.log(`--- Testing user: ${user.name} ---`);
    const persona = PersonaEngine.generatePersona(user);
    console.log(`Age Group: ${persona.ageGroup}`);
    console.log(`Vibe: ${persona.vibe}`);
    console.log(`Country Style: ${persona.countryStyle}`);
    console.log(`Seed ID: ${persona.seedId}`);
    console.log(`Prompt Preview: ${persona.personaPrompt.substring(0, 100)}...`);
    
    // Consistency check
    const persona2 = PersonaEngine.generatePersona(user);
    if (persona.seedId === persona2.seedId) {
      console.log('✅ Consistency check passed (Seed ID matches)');
    } else {
      console.log('❌ Consistency check failed');
    }
    console.log('\n');
  });
}

// Node.js 환경에서 모듈 시스템 차이로 인해 간단한 래퍼 사용
try {
    testPersona();
} catch (e) {
    console.log('Note: Running via node directly might need commonjs transpilation. Testing logic manually if needed.');
    console.error(e);
}
