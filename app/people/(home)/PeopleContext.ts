import {createContext} from '@ark-ui/react';
import type {Person} from '~/types/Person';

export const [PeopleProvider, usePeopleContext] = createContext<Person[]>();
export const [PersonProvider, usePersonContext] = createContext<Person>();
