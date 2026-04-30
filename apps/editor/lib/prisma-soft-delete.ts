import { Prisma } from '../prisma/generated-client'

/**
 * Prisma client extension for automatic soft-delete filtering on the Project model.
 *
 * Purpose:
 * 1. Prevents soft-deleted projects from appearing in queries unless explicitly bypassed.
 *    All standard read operations (findUnique, findFirst, findMany) automatically exclude
 *    records where deletedAt is non-null.
 *
 * 2. Normal delete() operations on projects should NOT be called directly; instead,
 *    dashboard/actions.ts will perform a soft-delete by setting deletedAt = new Date().
 *
 * 3. Archive/restore actions manage the deletedAt timestamp:
 *    - Archive: set deletedAt = new Date()
 *    - Restore: set deletedAt = null
 */
export const softDeleteExtension = Prisma.defineExtension((client) =>
  client.$extends({
    query: {
      project: {
        /**
         * Intercept findUnique to exclude soft-deleted projects.
         * Merges deletedAt: null into the existing where clause using AND.
         */
        async findUnique({ args, query }) {
          args.where = args.where
            ? { AND: [args.where, { deletedAt: null }] }
            : { deletedAt: null }
          return query(args)
        },

        /**
         * Intercept findUniqueOrThrow to exclude soft-deleted projects.
         */
        async findUniqueOrThrow({ args, query }) {
          args.where = args.where
            ? { AND: [args.where, { deletedAt: null }] }
            : { deletedAt: null }
          return query(args)
        },

        /**
         * Intercept findFirst to exclude soft-deleted projects.
         */
        async findFirst({ args, query }) {
          args.where = args.where
            ? { AND: [args.where, { deletedAt: null }] }
            : { deletedAt: null }
          return query(args)
        },

        /**
         * Intercept findFirstOrThrow to exclude soft-deleted projects.
         */
        async findFirstOrThrow({ args, query }) {
          args.where = args.where
            ? { AND: [args.where, { deletedAt: null }] }
            : { deletedAt: null }
          return query(args)
        },

        /**
         * Intercept findMany to exclude soft-deleted projects from all list queries.
         * This covers dashboard grid views, getDashboardData, and all project listings.
         */
        async findMany({ args, query }) {
          args.where = args.where
            ? { AND: [args.where, { deletedAt: null }] }
            : { deletedAt: null }
          return query(args)
        },

        /**
         * Intercept count to exclude soft-deleted projects from counts.
         */
        async count({ args, query }) {
          args.where = args.where
            ? { AND: [args.where, { deletedAt: null }] }
            : { deletedAt: null }
          return query(args)
        },
      },
    },
  })
)
