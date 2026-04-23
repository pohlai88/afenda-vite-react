function escapeRegexCharacter(character: string): string {
  return /[\\^$.*+?()[\]{}|]/u.test(character) ? `\\${character}` : character
}

function globSegmentToRegExpSource(pattern: string): string {
  let source = ""

  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index]

    if (character === "*") {
      source += "[^/]*"
      continue
    }

    if (character === "?") {
      source += "[^/]"
      continue
    }

    source += escapeRegexCharacter(character)
  }

  return source
}

function matchesSegment(fileSegment: string, patternSegment: string): boolean {
  const matcher = new RegExp(
    `^${globSegmentToRegExpSource(patternSegment)}$`,
    "u"
  )

  return matcher.test(fileSegment)
}

function matchesPathSegments(
  fileSegments: readonly string[],
  patternSegments: readonly string[]
): boolean {
  if (patternSegments.length === 0) {
    return fileSegments.length === 0
  }

  const [patternHead, ...patternTail] = patternSegments
  if (patternHead === "**") {
    if (matchesPathSegments(fileSegments, patternTail)) {
      return true
    }

    for (let index = 0; index < fileSegments.length; index += 1) {
      if (matchesPathSegments(fileSegments.slice(index + 1), patternTail)) {
        return true
      }
    }

    return false
  }

  const [fileHead, ...fileTail] = fileSegments
  if (fileHead === undefined) {
    return false
  }

  return (
    matchesSegment(fileHead, patternHead) &&
    matchesPathSegments(fileTail, patternTail)
  )
}

export function matchesPathPattern(filePath: string, pattern: string): boolean {
  if (pattern === "*") {
    return true
  }

  const normalizedFilePath = filePath.replaceAll("\\", "/")
  const normalizedPattern = pattern.replaceAll("\\", "/")

  return matchesPathSegments(
    normalizedFilePath.split("/"),
    normalizedPattern.split("/")
  )
}

export function matchesAnyPathPattern(
  filePath: string,
  patterns: readonly string[]
): boolean {
  return patterns.some((pattern) => matchesPathPattern(filePath, pattern))
}
