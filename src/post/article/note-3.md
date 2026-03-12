---
title: CITのpropatiesメモ
date: 2026-03-07
layout: "post"
tags: [note, minecraft]
---

複数のCITルールが同じ項目に一致する場合に重み(weight)を付与することで，読み込む順番を操作できる

```bash
# デフォルトの次に読み込みたい場合
type=item
items=minecraft:diamond_pickaxe
texture=custom_1
nbt.display.Name=Custom_pickaxe
weight=-1
```

正規表現めも

```bash
# ooo記念品，xxx記念品，---記念品に同じテクスチャを割り当てたい場合
nbt.display.Lore.*=iregex:.*記念品

# 表記ゆれ対策(：2026|: 2026)
nbt.display.Lore.*=iregex:\year(\uff1a2026|: 2026)
```
