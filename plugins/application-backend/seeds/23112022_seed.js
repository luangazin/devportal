exports.seed = async function (knex) {
  try {
    // Deletes ALL existing entries
    await knex('plugins').truncate();
    knex.raw('TRUNCATE TABLE services CASCADE')
    // await knex('services').truncate(); // cannot truncate a table referenced in a fk constraint
    await knex('partners').truncate();
    await knex('applications').truncate();
    // Inserts seed entries
    await knex('services').insert([
      {
        id: 'ad94b906-4970-11ed-b878-0242ac120001',
        name: 'service with ',
        description: 'test description',
        redirectUrl: 'https://test.com.br',
        partnersId: [
          'ad94b906-4970-11ed-b878-0242ac120001',
          '27447ec1-d67f-4233-bfb1-0f11f7ccca28',
        ],
        kongServiceName: 'teste',
        kongServiceId: '20a93081-8cf6-45c8-b33d-0d391b7bbe58',
        rateLimiting: '120',
        createdAt: new Date(),
        updatedAt: new Date(),
        securityType: "key-auth"
      },

      {
        id: '78fdef0b-1c66-4b59-8b7c-6ecbcf9f289e',
        name: 'test service 2',
        description: 'test description',
        redirectUrl: 'https://test.com.br',
        partnersId: [
          'ad94b906-4970-11ed-b878-0242ac120001',
          '27447ec1-d67f-4233-bfb1-0f11f7ccca28',
        ],
        kongServiceName: 'kong service test 2',
        kongServiceId: '89dbedab-5b38-460c-a0eb-92898f45090b',
        rateLimiting: '120',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3d10516c-cb06-4196-ae32-7f0bfd0b490b',
        name: 'test Service 3',
        description: 'test description',
        redirectUrl: 'https://test.com.br',
        partnersId: [
          'ad94b906-4970-11ed-b878-0242ac120001',
          '27447ec1-d67f-4233-bfb1-0f11f7ccca28',
        ],
        kongServiceName: 'kong service test 3',
        kongServiceId: '491f34e7-15bc-4d68-add1-e0b8a71762b0',
        rateLimiting: '120',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    await knex('partners').insert([
      {
        id: 'ad94b906-4970-11ed-b878-0242ac120002',
        name: 'nome testador',
        email: 'teste@email.com',
        celular: '21 999999999',
        servicesId: [
          '0754b73e-9c27-4713-963b-3eecb38be72e',
          '102a725c-e7a6-437d-8167-606af722c2e6',
        ],
        applicationId: [
          '0754b73e-9c27-4713-963b-3eecb38be72e',
          '102a725c-e7a6-437d-8167-606af722c2e6',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '27447ec1-d67f-4233-bfb1-0f11f7ccca28',
        name: 'nome testador segundo',
        email: 'teste@email.com',
        celular: '21 999999999',
        servicesId: [
          '0754b73e-9c27-4713-963b-3eecb38be72e',
          '102a725c-e7a6-437d-8167-606af722c2e6',
        ],
        applicationId: [
          '0e3d3798-dd82-4d15-802b-6e4b75244334',
          '0754b73e-9c27-4713-963b-3eecb38be72e',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '44a67075-649c-4f3f-9c2a-c198765d4656',
        name: 'nome testador terceiro',
        email: 'teste@email.com',
        celular: '21 999999999',
        servicesId: [
          '0754b73e-9c27-4713-963b-3eecb38be72e',
          '102a725c-e7a6-437d-8167-606af722c2e6',
        ],
        applicationId: ['102a725c-e7a6-437d-8167-606af722c2e6'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    await knex('applications').insert([
      {
        id: '0754b73e-9c27-4713-963b-3eecb38be72e',
        name: 'application teste with kong consumer okteto',
        creator: 'nome creator teste',
        servicesId: ['fed8971d-b83f-4901-991d-0620f7c3b9f1'],
        kongConsumerName: 'consumer',
        kongConsumerId: '7135150b-500c-40e1-bee5-cedcbaeefecd',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '0e3d3798-dd82-4d15-802b-6e4b75244334',
        name: 'application teste 2',
        creator: 'nome creator teste 2',
        servicesId: [
          '78fdef0b-1c66-4b59-8b7c-6ecbcf9f289e',
          '3d10516c-cb06-4196-ae32-7f0bfd0b490b',
        ],
        kongConsumerName: 'nome kong consumer 2',
        kongConsumerId: '7ee6a7f4-59cf-4831-952b-6e52c5002a00',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '102a725c-e7a6-437d-8167-606af722c2e6',
        name: 'application teste 3',
        creator: 'nome creator teste 3',
        servicesId: ['78fdef0b-1c66-4b59-8b7c-6ecbcf9f289e'],
        kongConsumerName: 'nome kong consumer 3',
        kongConsumerId: '06ef54bf-08f4-4f5f-9527-9862709fa9c9',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '0754b73e-9c27-4713-963b-3eecb38be72f',
        name: 'application teste with kong consumer okteto',
        creator: 'teste',
        servicesId: ['fed8971d-b83f-4901-991d-0620f7c3b9f1'],
        kongConsumerName: 'felix',
        kongConsumerId: '828aadb5-e1a2-463b-b627-437f1431fb68',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    await knex('plugins').insert([
      {
        id: 'a0b50188-8065-11ed-a1eb-0242ac120002',
        name: 'key-auth',
        active: true,
        pluginId: '54710239-6bde-4bac-baad-bd730bbd2f6c',
        service: 'ad94b906-4970-11ed-b878-0242ac120001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  } catch (e) {
    console.log('ERROR SEED:RUN ', e);
    return false;
  }
};
