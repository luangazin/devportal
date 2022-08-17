// import { DatabaseHandler } from './DatabaseHandler';
// import { TestDatabaseId, TestDatabases } from '@backstage/backend-test-utils';

// const bazaarProject: any = {
//   name: 'n1',
//   entityRef: 'ref1',
//   community: '',
//   status: 'proposed',
//   description: 'a',
//   membersCount: 0,
//   startDate: '2021-11-07T13:27:00.000Z',
//   endDate: null,
//   size: 'small',
//   responsible: 'r',
// };

// describe('DatabaseHandler', () => {
//   const databases = TestDatabases.create({
//     ids: ['POSTGRES_13', 'POSTGRES_9', 'SQLITE_3'],
//   });

//   async function createDatabaseHandler(databaseId: TestDatabaseId) {
//     const knex = await databases.init(databaseId);
//     return {
//       knex,
//       dbHandler: await DatabaseHandler.create({ database: knex }),
//     };
//   }

//   it.each(databases.eachSupportedId())(
//     'should insert and get entity, %p',
//     async databaseId => {
//       const { knex, dbHandler } = await createDatabaseHandler(databaseId);

//       await knex('metadata').insert({
//         entity_ref: bazaarProject.entityRef,
//         name: bazaarProject.name,
//         description: bazaarProject.description,
//         community: bazaarProject.community,
//         status: bazaarProject.status,
//         updated_at: new Date().toISOString(),
//         start_date: bazaarProject.startDate,
//         end_date: bazaarProject.endDate,
//         size: bazaarProject.size,
//         responsible: bazaarProject.responsible,
//       });

//       const res = await dbHandler.getMetadataByRef('ref1');

//       expect(res).toHaveLength(1);
//       expect(res[0].description).toEqual('a');
//       expect(res[0].community).toEqual('');
//       expect(res[0].status).toEqual('proposed');
//       expect(res[0].start_date).toEqual('2021-11-07T13:27:00.000Z');
//       expect(res[0].end_date).toEqual(null);
//       expect(res[0].size).toEqual('small');
//       expect(res[0].responsible).toEqual('r');
//     },
//     60_000,
//   );
// });
