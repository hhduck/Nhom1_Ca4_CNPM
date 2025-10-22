const products = [
  {
    id: 1,
    name: "Entremets Rose",
    price: "650,000 VND",
    shortIntro: "Hoa hồng – Vải thiều – Mâm xôi – Phô mai trắng",
    shortParagraph: `Chiếc entremets nhẹ như một khúc nhạc Pháp, hòa quyện hương hoa hồng thanh thoát,
vải thiều ngọt mát, mâm xôi chua nhẹ và mousse phô mai trắng béo mềm. Từng lớp bánh được sắp đặt tỉ mỉ để mang đến cảm giác trong trẻo, tinh khôi và đầy nữ tính — một “nụ hồng ngọt ngào” dành cho những tâm hồn yêu sự dịu dàng.`,
    description: `<p>Một chiếc entremets tựa như đoá hồng nở trong nắng sớm — nhẹ nhàng, tinh khôi và ngọt ngào theo cách riêng. Entremets Rose là sự hòa quyện giữa vải thiều mọng nước, mâm xôi chua thanh, phô mai trắng béo mịn và hương hoa hồng phảng phất, tạo nên cảm giác trong trẻo, nữ tính và đầy tinh tế.
    Bánh được hoàn thiện với những nguyên liệu tuyển chọn kỹ lưỡng: trái cây tươi nhập khẩu, kem phô mai mềm mượt, cốt bánh nướng thủ công và lớp mousse mịn nhẹ như mây. Mỗi muỗng bánh là một lát cắt của sự thanh thoát — dịu dàng mà vẫn đọng lại dư vị khó quên. 
    Một món bánh không chỉ để thưởng thức, mà còn để cảm nhận — như một bông hồng ngọt ngào mang hồn vị của La Cuisine Ngọt.</p>`,
    structure: `
      <ul>
        <li><b>Lớp 1 – Biscuit Madeleine Framboise:</b> Cốt bánh mềm nhẹ, thấm vị chua thanh tự nhiên từ mâm xôi tươi.</li>
        <li><b>Lớp 2 – Confit Framboise:</b> Mứt mâm xôi cô đặc nấu chậm, giữ trọn vị chua ngọt tươi mới.</li>
        <li><b>Lớp 3 – Crémeux Litchi Rose:</b> Nhân kem vải thiều hòa cùng hương hoa hồng – mềm mịn, thanh tao và thơm dịu.</li>
        <li><b>Lớp 4 – Mousse Fromage Blanc:</b> Lớp mousse phô mai trắng mịn như mây, mang vị béo nhẹ và cảm giác tan ngay nơi đầu lưỡi.</li>
        <li><b>Lớp 5 – Shortbread:</b> Đế bánh bơ giòn tan, tạo điểm nhấn hài hòa cho tổng thể.</li>
      </ul>
      <p>Trang trí bằng hoa edible, mâm xôi tươi và lớp xịt nhung trắng (velours) — tinh khôi, thanh lịch.</p>
    `,
usage: `
  <ul class="no-dot">
    <li>Bảo quản bánh trong hộp kín, giữ ở ngăn mát tủ lạnh (2–6°C).</li>
    <li>Tránh để bánh tiếp xúc trực tiếp với ánh nắng hoặc nhiệt độ phòng quá lâu.</li>
    <li>Bánh ngon nhất khi dùng trong vòng 24 giờ kể từ lúc nhận.</li>
    <li>Nên dùng muỗng lạnh để cảm nhận rõ từng tầng hương vị – mềm, mịn và tan chảy tinh tế.</li>
  </ul>
`,

bonus: `
  <ul class="no-dot">
    <li>Bộ dao, muỗng và dĩa gỗ mang phong cách thủ công, tinh tế.</li>
    <li>Hộp nến nhỏ để bạn dễ dàng biến chiếc bánh thành món quà hoặc điểm nhấn cho những dịp đặc biệt.</li>
    <li>Thiệp cảm ơn La Cuisine Ngọt – gửi gắm lời chúc ngọt ngào kèm thông điệp từ trái tim.</li>
  </ul>
`,
    image: "../../assets/images/Entremets Rose.jpg"
  },

  {
    id: 2,
    name: "Lime and Basil Entremets",
    price: "450,000 VND",
    shortIntro: "Chanh, Húng Quế và Kem Tươi",
    shortParagraph: `Chiếc entremets mang sắc xanh ngọc thạch quyến rũ, là bản hòa tấu bất ngờ giữa vị chua sáng rỡ của những trái chanh xanh căng mọng và hương thơm ấm áp, nồng nàn của húng quế. 
    Từng lớp mousse được chăm chút tỉ mỉ, tạo nên sự đối lập hoàn hảo: mềm tan của kem mousse - giòn xốp của đế bánh, tinh khôi mà đầy mê hoặc. 
    Một chiếc bánh dành cho những ai trân trọng khoảnh khắc thanh lọc, sảng khoái, yêu hương vị độc đáo và sống động – "La Cuisine Ngọt" gửi gắm cảm xúc qua từng muỗng bánh, như một làn gió hè tươi mát.`,
    description: `<p>Bánh Entremets Chanh – Húng Quế là sự hòa quyện hoàn hảo giữa vị chua dịu của chanh xanh tươi và hương thơm thanh khiết của lá húng quế. Lớp mousse chanh mịn màng, vừa tươi vừa nhẹ, được điểm xuyết bằng những lá húng quế nghiền nhẹ, tạo cảm giác tươi mới và thanh thoát. 
    Đế bánh giòn rụm cân bằng vị chua, mang đến sự cân bằng giữa ngon miệng và tinh tế, khiến mỗi miếng bánh là một trải nghiệm vị giác độc đáo và khó quên.</p>
    <p>Bánh kết hợp khéo léo giữa các kết cấu: giòn – mịn – tươi, và hương vị: chua – thơm – nhẹ, mang đến cảm giác thanh lịch, tinh tế, vừa sang trọng vừa tươi mát.</p>`,
    structure: `
      <ul>
        <li><b>Lớp 1 – Biscuit Sablé (Đế bánh giòn):</b> Đế bơ giòn rụm, tạo độ tương phản hoàn hảo với phần mousse mềm mại phía trên.</li>
        <li><b>Lớp 2 – Crèmeux Citron Vert (Kem chanh xanh):</b> Nhân kem chua dịu, đậm đặc từ nước cốt và vỏ chanh, mang vị chua thanh khiết, tươi mát.</li>
        <li><b>Lớp 3 – Mousse Basilic (Mousse húng quế):</b> Lớp mousse nhẹ, xốp, thấm đượm hương thơm tinh tế của lá húng quế.</li>
        <li><b>Lớp 4 – Gelée chanh:</b> Một lớp gelée chanh mỏng, tăng độ tươi mới và tạo chiều sâu cho bánh.</li>
        <li><b>Lớp 5 – Miroir Glaze Vert:</b> Lớp phủ bóng màu xanh lá ngọc, giữ độ ẩm và tạo vẻ ngoài hấp dẫn.</li>
      </ul>
      <p>Trang trí: lát chanh tươi và lá húng quế (hoặc bạc hà), điểm xuyết chút đường bột.</p>
    `,
    usage: `Bảo quản bánh trong hộp kín, giữ ở ngăn mát tủ lạnh (2–6°C). Tránh để bánh tiếp xúc trực tiếp với ánh nắng hoặc nhiệt độ phòng quá lâu. Bánh ngon nhất khi dùng trong vòng 24 giờ kể từ lúc nhận. Nên dùng muỗng lạnh để cảm nhận các tầng vị.`,
    bonus: `Bộ dao, muỗng và dĩa gỗ phong cách thủ công. Hộp nến nhỏ. Thiệp cảm ơn La Cuisine Ngọt.`,
    image: "../../assets/images/Lime and Basil Entremets.jpg"
  },

  {
    id: 3,
    name: "Blanche Figues & Framboises",
    price: "600,000 VND",
    shortIntro: "Sung – Mâm Xôi – Sô Cô La Trắng",
    shortParagraph: `Chiếc entremets mang vẻ tinh tế với lớp gương sô cô la trắng bóng mịn bao phủ. Bên trong là bánh bông xốp mâm xôi, compoté sung – mâm xôi dẻo thơm và mousse sô cô la trắng béo nhẹ, tan ngay trong miệng. Sự hòa quyện giữa vị chua thanh của mâm xôi, hương ngọt dịu của sung và độ mượt của sô cô la trắng tạo nên một hương vị thanh lịch, hài hòa và đầy cuốn hút.`,
    description: `<p>Có những ngày, chỉ cần một miếng bánh thôi cũng đủ khiến lòng nhẹ đi đôi chút. Entremets Sung – Mâm Xôi – Sô Cô La Trắng là bản giao hưởng giữa vị chua thanh của mâm xôi, độ ngọt dịu của sung chín và sự béo mịn, thanh tao của sô cô la trắng. Từng lớp bánh đan xen mượt mà, tan chảy như sương đầu sáng — dịu dàng mà sâu lắng. Bánh được tạo nên từ những nguyên liệu thượng hạng: sô cô la trắng Ivoire Valrhona, trái sung và mâm xôi tươi nhập khẩu, cốt bánh nướng thủ công, cùng lớp compoté nấu chậm giữ trọn hương vị tự nhiên. Mỗi thành phần đều được cân chỉnh tỉ mỉ để mang đến trải nghiệm vị giác tinh tế, trọn vẹn và đầy cảm xúc.</p>
    <p>Một chiếc bánh nhẹ như hơi thở, sang như bản nhạc Pháp, và ngọt ngào theo cách riêng của “La Cuisine Ngọt”.</p>`,
    structure: `
      <ul>
        <li><b>Lớp 1 – Cốt bánh mâm xôi:</b> Bánh bông xốp mềm nhẹ, thấm vị chua thanh tự nhiên từ mâm xôi tươi.</li>
        <li><b>Lớp 2 – Compoté sung – mâm xôi:</b> Hỗn hợp trái cây nấu chậm giữ cấu trúc và hương vị.</li>
        <li><b>Lớp 3 – Mousse sô cô la trắng:</b> Mềm mượt, nhẹ bẫng như mây với sô cô la trắng cao cấp.</li>
        <li><b>Lớp 4 – Gương sô cô la trắng:</b> Phủ bề mặt bằng glaçage mịn như lụa.</li>
      </ul>
    `,
    usage: `Bảo quản bánh trong hộp kín, giữ ở ngăn mát tủ lạnh (2–6°C). Tránh ánh nắng trực tiếp. Bánh ngon nhất khi dùng trong vòng 24 giờ kể từ lúc nhận. Nên dùng muỗng lạnh.`,
    bonus: `Bộ dao, muỗng gỗ; hộp nến nhỏ; thiệp cảm ơn La Cuisine Ngọt.`,
    image: "../../assets/images/Blanche Figues & Framboises.jpg"
  },

  {
    id: 4,
    name: "Mousse Chanh dây",
    price: "550,000 VND",
    shortIntro: "Chanh dây, whipping cream, phô mai mascarpone",
    shortParagraph: `Chiếc Mousse Chanh Dây là sự kết hợp tinh tế của hương vị nhiệt đới tươi mới. Lớp custard chua thanh hòa quyện cùng những miếng chanh dây mọng nước, điểm xuyết lớp mousse whipping mềm mịn, béo nhẹ, tan ngay trên đầu lưỡi. Từng muỗng bánh mang đến trải nghiệm vị giác sống động, cân bằng hoàn hảo giữa chua – ngọt – béo, nhẹ nhàng mà đầy quyến rũ.`,
    description: `<p>Bánh Mousse Chanh Dây là món tráng miệng tinh tế, mang đến cảm giác tươi mát và sảng khoái ngay từ muỗng đầu tiên. Bánh hòa quyện hoàn hảo vị chua thanh của chanh dây với lớp mousse whipping mềm mịn, béo nhẹ, tan chảy trên đầu lưỡi mà vẫn giữ sự nhẹ nhàng, không ngấy.</p>
    <p>Về kết cấu, bánh mousse nổi bật với lớp bọt khí nhẹ nhàng, xốp mượt và tươi mới, kết hợp cùng lớp đế cookie giòn rụm hoặc custard chua thanh, tạo trải nghiệm vị giác cân bằng giữa mềm – giòn – chua – béo.</p>`,
    structure: `
      <ul>
        <li><b>Lớp 1 – Đế bánh (Base Cookie / Biscuit):</b> Đế giòn rụm, thơm bơ.</li>
        <li><b>Lớp 2 – Kem chanh dây + Whipping & Mascarpone:</b> Mousse mềm mượt, béo nhẹ và chua thanh.</li>
        <li><b>Lớp 3 – Gelée chanh dây:</b> Lớp gelée tươi mát, hơi sánh nhẹ tăng độ sống động.</li>
      </ul>
    `,
    usage: `Bảo quản ngăn mát 2–6°C. Tránh ánh nắng. Dùng trong vòng 24 giờ kể từ khi nhận. Dùng muỗng lạnh để cảm nhận các tầng vị.`,
    bonus: `Bộ dao, muỗng gỗ; hộp nến nhỏ; thiệp La Cuisine Ngọt.`,
    image: "../../assets/images/Mousse Chanh dây.jpg"
  },

  {
    id: 5,
    name: "Mousse Dưa lưới",
    price: "550,000 VND",
    shortIntro: "Dưa lưới hữu cơ, kem sữa, phô mai Mascarpone",
    shortParagraph: `Bánh có vị thơm và béo nhẹ nhàng từ phô mai tươi kết hợp cùng kem sữa và dưa lưới mật Fuji nấu chậm, bên trong là rất nhiều dưa lưới tươi và cốt bánh gato vani, cùng với một ít rượu dưa lưới nồng nàn. Mousse Dưa Lưới vừa đủ gây ấn tượng khi nhìn vào màu xanh mát lành tinh tươm với những cụm dưa tươi mát được trang trí bên ngoài.`,
    description: `<p>Ra đời giữa những ngày oi ả của Sài Gòn, chiếc Bánh Dưa Lưới như mang đến một khoảng trời mát lành và thanh khiết. Lớp mousse mềm mại từ phô mai tươi và kem sữa hòa quyện hoàn hảo với dưa lưới mật Fuji nấu chậm, bên trong là những miếng dưa tươi mọng cùng cốt bánh gato vani ẩm mềm và một chút rượu dưa lưới nồng nàn, tạo nên hương vị tinh tế, dịu dàng nhưng đầy ấn tượng.</p>
    <p>Màu xanh mát lành của bánh kết hợp với những cụm dưa tươi trang trí trên bề mặt vừa đủ để thu hút ánh nhìn, vừa gợi lên sự tò mò khi chạm dao vào từng miếng bánh mong manh. Khi thưởng thức, vị mềm mượt, mát lành và thanh thoát của dưa lưới tan dần trên đầu lưỡi, nhấn nhá bởi chút ngọt dịu và hương thơm tinh tế của kem phô mai.</p>`,
    structure: `
      <ul>
        <li><b>Lớp 1 – Bánh bông lan vị vani (Vanilla Génoise):</b> Cốt bánh xốp mềm, ẩm mượt.</li>
        <li><b>Lớp 2 – Dưa lưới mật tươi thái hạt lựu:</b> Miếng dưa tươi căng mọng.</li>
        <li><b>Lớp 3 – Mousse dưa lưới:</b> Mousse mềm mượt, béo nhẹ.</li>
      </ul>
    `,
    usage: `Bảo quản ngăn mát 2–6°C. Tránh ánh nắng. Dùng trong 24 giờ kể từ khi nhận. Dùng muỗng lạnh.`,
    bonus: `Bộ dao, muỗng gỗ; hộp nến nhỏ; thiệp cảm ơn.`,
    image: "../../assets/images/Mousse Dưa lưới.jpg"
  },

  {
    id: 6,
    name: "Mousse Việt quất",
    price: "550,000 VND",
    shortIntro: "Việt quất, whipping cream",
    shortParagraph: `Mousse Việt Quất chinh phục vị giác bằng sắc tím quyến rũ và hương vị trái cây thanh mát. Lớp mousse mềm mượt, hòa quyện cùng vị chua nhẹ, mang lại cảm giác thanh tao và dễ chịu. Mỗi miếng bánh là sự kết hợp tinh tế giữa vị ngọt dịu và hương thơm tự nhiên của việt quất.`,
    description: `<p>Bánh Mousse Việt Quất là sự kết hợp hoàn hảo giữa vị chua nhẹ thanh mát của quả việt quất và vị béo ngậy của kem tươi. Lớp mousse mịn màng, tan ngay trong miệng, mang lại cảm giác nhẹ nhàng, tươi mới nhưng vẫn đậm đà hương vị tự nhiên. Bánh được điểm xuyết những quả việt quất tươi trên mặt, tạo vẻ ngoài vừa tinh tế vừa sang trọng.</p>`,
    structure: `
      <ul>
        <li><b>Lớp 1 – Đế bánh (Base Cookie / Biscuit):</b> Đế bánh giòn rụm, thơm bơ.</li>
        <li><b>Lớp 2 – Mousse việt quất:</b> Mousse mịn mượt, hương việt quất tự nhiên.</li>
        <li><b>Lớp 3 – Trang trí việt quất tươi:</b> Điểm xuyết trên mặt bánh.</li>
      </ul>
    `,
    usage: `Bảo quản ngăn mát 2–6°C. Tránh ánh nắng. Dùng trong 24 giờ kể từ khi nhận. Dùng muỗng lạnh.`,
    bonus: `Bộ dao, muỗng gỗ; hộp nến nhỏ; thiệp cảm ơn.`,
    image: "../../assets/images/Mousse Việt Quất.jpg"
  },

  {
    id: 7,
    name: "Orange Serenade",
    price: "550,000 VND",
    shortIntro: "Cam tươi, Earl Grey, kem phô mai, whipping cream",
    shortParagraph: `Chiếc bánh là sự kết hợp thanh tao giữa vị trà bá tước Earl Grey dịu nhẹ và vị cam tươi sáng chua ngọt. Cảm giác béo mịn, thoang thoảng hương trà và thoảng vị cam mọng nước như một buổi chiều hè dịu nắng.`,
    description: `<p>Orange Serenade được lấy cảm hứng từ tách trà Earl Grey ấm áp và lát cam tươi mát của mùa hè. Cốt bánh được ủ cùng trà bá tước, mang lại hương trà dịu nhẹ, thanh thoát. Xen giữa các lớp bánh là phần xốt cam chua ngọt và kem phô mai béo mịn — hòa quyện vừa đủ để tạo nên vị ngọt thanh, tròn đầy.</p>
    <p>Ẩn trong nhân là lớp thạch cam trong veo, dẻo nhẹ, mang hương vị cam tự nhiên giúp cân bằng vị béo, tạo điểm nhấn tươi mát cho tổng thể chiếc bánh.</p>`,
    structure: `
      <ul>
        <li><b>Lớp 1 – Gato trà bá tước (Earl Grey sponge):</b> Cốt bánh mềm ẩm, ủ cùng trà bá tước.</li>
        <li><b>Lớp 2 – Jelly cam (Orange jelly):</b> Thạch cam mát lạnh, dẻo nhẹ.</li>
        <li><b>Lớp 3 – Kem phô mai cam (Orange cream cheese):</b> Kem phô mai chua nhẹ, béo mịn.</li>
        <li><b>Lớp 4 – Earl Grey cream:</b> Lớp kem trà mịn mượt.</li>
      </ul>
    `,
    usage: `Bảo quản ngăn mát 2–6°C. Tránh ánh nắng. Dùng trong 24 giờ kể từ khi nhận. Dùng muỗng lạnh.`,
    bonus: `Bộ dao, muỗng gỗ; hộp nến nhỏ; thiệp cảm ơn.`,
    image: "../../assets/images/Orange Serenade.jpg"
  },

  {
    id: 8,
    name: "Strawberry Cloud Cake",
    price: "500,000 VND",
    shortIntro: "Dâu tươi, việt quất, kem tươi Pháp, cốt bánh vanilla mềm ẩm",
    shortParagraph: `Chiếc bánh kem mang sắc trắng thanh khiết, điểm xuyết tầng dâu đỏ và việt quất xanh tím rực rỡ. Từng lớp bánh là sự hòa quyện giữa vị béo nhẹ của kem tươi, vị ngọt thanh của trái cây và cốt bánh vanilla mềm mịn — đơn giản mà tinh tế, như một áng mây ngọt ngào dành tặng những khoảnh khắc yêu thương.`,
    description: `<p>Strawberry Cloud Cake là chiếc bánh mang phong vị tươi sáng của những trái dâu mọng và việt quất ngọt thanh, kết hợp cùng lớp kem tươi mềm nhẹ và cốt bánh vani thơm dịu. Mỗi lát bánh là sự giao hòa giữa vị trái cây tươi mát, vị ngọt dịu của kem và cốt bánh ẩm mịn, tạo nên cảm giác trong trẻo và đầy sức sống. Không chỉ là món tráng miệng, đây là chiếc bánh mang đến cảm giác thư giãn và ngọt ngào — hoàn hảo cho tiệc sinh nhật, trà chiều hay những dịp tặng quà.</p>`,
    structure: `
      <ul>
        <li><b>Lớp 1 – Cốt bánh vanilla mềm ẩm:</b> Lớp nền truyền thống, mềm mịn.</li>
        <li><b>Lớp 2 – Kem tươi whipping nhẹ béo:</b> Kem đánh bông mềm mịn.</li>
        <li><b>Lớp 3 – Mặt bánh phủ dâu tây & việt quất tươi:</b> Trái cây tươi trang trí trên mặt.</li>
      </ul>
    `,
    usage: `Bảo quản ngăn mát 2–6°C. Tránh ánh nắng. Dùng trong 24 giờ kể từ khi nhận. Dùng muỗng lạnh.`,
    bonus: `Bộ dao, muỗng gỗ; hộp nến nhỏ; thiệp cảm ơn.`,
    image: "../../assets/images/Strawberry Cloud Cake.jpg"
  },

  {
    id: 9,
    name: "Earl Grey Bloom",
    price: "500,000 VND",
    shortIntro: "Trà bá tước, xoài tươi, dâu tây, whipping cream",
    shortParagraph: `Chiếc bánh là phiên bản đặc biệt của dòng Earl Grey cake — mang hương vị thanh nhã, nhẹ nhàng và đầy nữ tính. Lớp cốt trà bá tước thơm dịu kết hợp cùng vị trái cây tươi chua ngọt, tạo nên tổng thể hài hòa, tinh tế và dễ chịu.`,
    description: `<p>Earl Grey Bloom là bản hòa ca của trà, trái cây và hương hoa — chiếc bánh dành riêng cho những ai yêu nét đẹp nhẹ nhàng, thanh lịch. Cốt bánh mềm mịn được ủ với lá trà bá tước hảo hạng, tỏa hương thơm thanh mát đặc trưng của cam bergamot. Lớp nhân giữa là sự kết hợp của xoài vàng mọng nước và dâu tây tươi ngọt thanh, giúp làm nổi bật vị trà nhẹ nhàng nhưng sâu lắng. Bên ngoài là lớp kem whipping mịn nhẹ, được đánh bông nhẹ, phủ đều và trang trí tinh tế bằng trái cây khô, rosemary xanh và hoa nhỏ.</p>`,
    structure: `
      <ul>
        <li><b>Lớp 1 – Cốt bánh Earl Grey:</b> Bông lan mềm ẩm, ủ cùng trà bá tước.</li>
        <li><b>Lớp 2 – Nhân trái cây tươi:</b> Xoài chín và dâu tây tươi xen kẽ.</li>
        <li><b>Lớp 3 – Kem Earl Grey:</b> Kem whipping pha chiết xuất trà bá tước.</li>
      </ul>
    `,
    usage: `Bảo quản ngăn mát 2–6°C. Tránh ánh nắng. Dùng trong 24 giờ kể từ khi nhận. Dùng muỗng lạnh.`,
    bonus: `Bộ dao, muỗng gỗ; hộp nến nhỏ; thiệp cảm ơn.`,
    image: "../../assets/images/Earl Grey Bloom.jpg"
  }
];
