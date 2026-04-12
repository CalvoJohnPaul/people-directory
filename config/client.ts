import {environmentManager, QueryClient} from '@tanstack/react-query';

function $createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
        refetchOnMount: false,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let $browserClient: QueryClient;

export function getClient() {
  if (environmentManager.isServer()) {
    return $createClient();
  }

  if (!$browserClient) {
    $browserClient = $createClient();
  }

  return $browserClient;
}
