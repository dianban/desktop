import { Test1, Test2 } from './'

export const a1Route = {
  path: '',
  childRoutes: [
    {
      path: '',
      component: Test1,
      isIndex: true,
      childRoutes: [
        {
          path: 't1',
          component: Test2,
        },
      ],
    },
  ],
}
