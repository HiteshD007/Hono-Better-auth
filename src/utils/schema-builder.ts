import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import RelayPlugin from "@pothos/plugin-relay";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import { prisma } from './prisma'
import { DateTimeResolver } from 'graphql-scalars';


const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes,
  Scalars: {
    Date:{
      Input: Date,
      Output: Date
    }
  }
}>({
  prisma:{
    client: prisma
  },
  plugins:[PrismaPlugin, RelayPlugin],
  relay:{
    cursorType:"String",
    clientMutationId:"omit"
  }
});

builder.addScalarType("Date", DateTimeResolver, {});

builder.prismaObject("User",{
  include:{
    sessions:true
  },
  fields: (t) => ({
    id: t.exposeID("id"),
    email: t.exposeString("email"),
    name: t.exposeString("name"),
    role: t.exposeString("role"),
    image: t.exposeString("image"),
    banReason: t.exposeString("banReason"),
    banned: t.exposeBoolean("banned"),
    emailVerified: t.exposeBoolean("emailVerified"),

    createdAt: t.expose("createdAt", {type: "Date"}),
    updatedAt: t.expose("updatedAt", {type: "Date"}),
  })
});

builder.prismaObject("Session",{
  fields: (t) => ({
    id: t.exposeID("id"),
    userId: t.exposeID("userId")
  })
});


builder.queryType({
  fields: (t) => ({
    users: t.prismaField({
      type: ["User"],
      resolve: (query) => prisma.user.findMany({...query}) 
    }),

    user: t.prismaField({
      type: "User",
      nullable: true,
      args: {id: t.arg.string({required:true})},
      resolve: (query, _parent, args) => prisma.user.findUnique({
        ...query,
        where:{
          id: args.id
        }
      })
    })
  })
});


export const QLSchema = builder.toSchema(); 