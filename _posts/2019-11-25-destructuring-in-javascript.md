---
title: Destructuring in JavaScript
lead: Making your code cleaner and more concise with destructuring.
date: 2019-11-25T13:20:56.785Z
tags:
  - typescript
  - javascript
syndication:
  dev: https://dev.to/arcath/destructuring-in-javascript-2bck
---
Destructuring allows you to assign values to variables in a quick shorthand instead of having multiple lines. I use it pretty much every day but I can't remember a time when I actually learned anything about it, it just kind of appeared in my code and I've used it ever since.

A prime example of its use in the wild is React, take this function component.

```ts
const MyComponent: React.FC<{startCount: number}> = ({startCount}) => {
  const [count, setCount] = useState(startCount)

  return <button onClick={() => setCount(count + 1)}>Count ({count})</button>
}
```

Without destructuring, it would look like this.

```ts
const MyComponent: React.FC<{startCount: number}> = (props) => {
  const countState = useState(props.startCount)

  return <button onClick={() => countState[1](countState[0] + 1)}>Count ({countState[0]})</button>
}
```

Both types of destructuing occur in this example so lets take a look at them.

## Array Destructuring

```ts
const array = [1,2,3]

const [c1, c2, c3] = array

c1 // 1
c2 // 2
c3 // 3
```

With Array Destructuring you are taking the elements in the array and assigning them to variables, as a result the order of variable names is important.

This is how React's `useState` works and it is used here because the React developers that wrote `useState` have no idea what the names you want to use for the variables are.

## Object Destructuring

```ts
const author = {
  age: 29
  name: 'adam'
}

const {age, name} = author

age // 29
name // adam
```

With Object destructuring the names of the object's properties are important. The properties of the object become the variables that come out of the destructuring.

Lets say `useState` actually returned an object of `{value: T, setValue: (newValue: T) => void}` we would have to assign those values as:

```ts
const {value, setValue} = useState(1)
```

As you can see its not very descriptive which is why the return value from `useState` is an array.

You can assign different variable names to destructured properties but the process would be cumbersome if we had to do it for every `useState` call.

```ts
const {value: count, setValue: setCount} = useState(1)
```

## useQuery and useLazyQuery

A great example of when/why you would use either return type is Apollo GraphQLs React Hooks of `useQuery` and `useLazyQuery`.

`useQuery` runs the query the moment the component is mounted and returns an object. This is great as you usually only have one query per component, and if you have more you should really merge them or move the code into another component. This means at a minimum you are pulling `loading`, `error` and `data` from `useQuery`.

```ts
const {loading, error, data} = useQuery(SOME_QUERY)
```

`useLazyQuery` on the other hand waits until it is called to run the query. To this end it returns an array the first element of which is the function to run the query and the second is the same return object as `useQuery` with an additional `called` property.

```ts
const [getAuthors, {called, loading, error, data}] = useLazyQuery(AUTHOR_QUERY)
```

I use destructring every day across all the code I write and it's become my default way of working as I'm sure it has for a lot of my fellow developers. Hopefully this article gives everyone new and old to destructuing an idea of what is going on when you use it.
