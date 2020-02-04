import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

let globalId = 0;

// By default, if no AutoIdProvider is present, this `globalId` is the ID
// counter. This will work fine for browser-only apps. For SSR support, use
// AutoIdProvider, which will have a scoped counter per request.
const Context = React.createContext(() => `svg-id-${globalId++}`);

/**
 * Provide auto generated IDs for the `useId` hook, with support for a custom
 * ID generator. Using this will ensure that each server-side request that
 * renders your app has their own ID counter that starts at 0.
 */
export default function AutoIdProvider({ children, getId: customGetId }) {
  const nextId = useRef(0);

  const getId = useCallback(
    () => (customGetId ? customGetId(nextId) : `svg-id-${nextId.current++}`),
    [customGetId],
  );

  return <Context.Provider value={getId}>{children}</Context.Provider>;
}

AutoIdProvider.Context = Context;

AutoIdProvider.propTypes = {
  children: PropTypes.node.isRequired,
  getId: PropTypes.func,
};
